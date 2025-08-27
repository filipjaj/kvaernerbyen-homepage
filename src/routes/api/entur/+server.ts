import { gql, GraphQLClient } from "graphql-request";
import type { RequestHandler } from "@sveltejs/kit";
import { site } from "$lib/config";

const baseUrl = "https://api.entur.io/journey-planner/v3/graphql";

const client = new GraphQLClient(baseUrl, {
  headers: {
    "ET-Client-Name": site.entur.clientName,
  },
});

const stopPlaceQuery = gql`
  query StopPlace(
    $stopPlaceId: String!
    $whitelistedTransportModes: [TransportMode]
    $whitelistedLines: [ID!]
    $numberOfDepartures: Int = 3
    $startTime: DateTime
  ) {
    stopPlace(id: $stopPlaceId) {
      name
      transportMode
      estimatedCalls(
        numberOfDepartures: $numberOfDepartures
        whiteListedModes: $whitelistedTransportModes
        whiteListed: { lines: $whitelistedLines }
        includeCancelledTrips: true
        startTime: $startTime
      ) {
        ...departure
      }
      situations {
        ...situation
      }
    }
  }

  fragment departure on EstimatedCall {
    quay {
      publicCode
      name
    }
    destinationDisplay {
      frontText
      via
    }
    aimedDepartureTime
    expectedDepartureTime
    expectedArrivalTime
    serviceJourney {
      id
      transportMode
      transportSubmode
      line {
        id
        publicCode
        presentation {
          textColour
          colour
        }
      }
    }
    cancellation
    realtime
    situations {
      ...situation
    }
  }

  fragment situation on PtSituationElement {
    id
    description {
      value
      language
    }
    summary {
      value
      language
    }
  }
`;

const queries = () => {
  return Object.values(site.entur.stopPlaces).map(async (stopPlace) => {
    return client.request(stopPlaceQuery, {
      stopPlaceId: stopPlace,
      startTime: new Date().toISOString(),
    });
  });
};
export const GET: RequestHandler = async () => {
  const data = await Promise.all(queries());

  return new Response(JSON.stringify(data));
};
