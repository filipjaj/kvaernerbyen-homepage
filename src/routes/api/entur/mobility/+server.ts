import type { Vehicle } from "$lib/components/mobility/types";
import { gql, GraphQLClient } from "graphql-request";
import type { RequestHandler } from "@sveltejs/kit";
import { site } from "$lib/config";

const vehicleQuery = gql`
  query GetVehicles(
    $minLon: Float!
    $minLat: Float!
    $maxLon: Float!
    $maxLat: Float!
  ) {
    vehicles(
      minimumLongitude: $minLon
      minimumLatitude: $minLat
      maximumLongitude: $maxLon
      maximumLatitude: $maxLat
    ) {
      lat
      lon
      system {
        name {
          translation {
            language
            value
          }
        }
        operator {
          id
        }
        openingHours
      }
      currentRangeMeters
      id
      currentFuelPercent
      vehicleType {
        name {
          translation {
            value
            language
          }
        }
        vehicleAssets {
          iconUrl
          iconLastModified
        }
        vehicleImage
        model
      }
      rentalUris {
        web
        ios
      }
    }
  }
`;

const baseUrl = "https://api.entur.io/mobility/v2/graphql";

const client = new GraphQLClient(baseUrl, {
  headers: {
    "ET-Client-Name": site.entur.clientName,
  },
});

const Icons = {
  "YBO:Operator:bolt":
    "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Bolt%20Logo.svg",
  "YRY:Operator:Ryde":
    "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Ryde%20Technology%20Logo.svg",
  "YVO:Operator:voi":
    "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/VOI%20Technology%20Logo.svg",
};

const FriendlyNames = {
  "YBO:Operator:bolt": "Bolt",
  "YRY:Operator:Ryde": "Ryde",
  "YVO:Operator:voi": "VOI",
};

export const GET: RequestHandler = async ({ url }) => {
  const { bounds } = site.mobility;
  const variables = {
    minLon: bounds.minLon,
    minLat: bounds.minLat,
    maxLon: bounds.maxLon,
    maxLat: bounds.maxLat,
  };
  const data = (await client.request(vehicleQuery, variables)) as { vehicles: Vehicle[] };

  // Optional counts view: /api/entur/mobility?counts=true
  if (url.searchParams.get("counts") === "true") {
    const counts = data.vehicles.reduce((acc, vehicle) => {
      const operatorId = vehicle.system.operator.id;
      const key =
        FriendlyNames[operatorId as keyof typeof FriendlyNames] ?? operatorId;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return new Response(JSON.stringify(counts), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const formatVehicle = (vehicle: Vehicle) => {
    return {
      id: vehicle.id,
      lat: vehicle.lat,
      lon: vehicle.lon,
      system: vehicle.system.name.translation[0].value,

      name: FriendlyNames[
        vehicle.system.operator.id as keyof typeof FriendlyNames
      ],
      operator: vehicle.system.operator.id,
      currentRangeMeters: vehicle.currentRangeMeters,

      iconUrl:
        Icons[vehicle.system.operator.id as keyof typeof Icons] ??
        "https://pub-8880548ea82e4e66913439824e2f4be4.r2.dev/Scooter%20Icon.png",
    };
  };

  return new Response(JSON.stringify(data.vehicles.map(formatVehicle)), {
    headers: { "Content-Type": "application/json" },
  });
};
