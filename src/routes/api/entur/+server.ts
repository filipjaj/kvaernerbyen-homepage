//Kværnerbyen
//NSR:StopPlace:6552

// Kværner
//NSR:StopPlace:6555

import { gql, GraphQLClient } from "graphql-request";

const baseUrl = "https://api.entur.io/journey-planner/v3/graphql";
const ETClientName = "filipjohansen-kvaernerbyen";

const client = new GraphQLClient(baseUrl, {
  headers: {
    "ET-Client-Name": ETClientName,
  },
});

const stopPlaceQuery = gql`
  query StopPlace(
    $stopPlaceId: String!
    $whitelistedTransportModes: [TransportMode]
    $whitelistedLines: [ID!]
    $numberOfDepartures: Int = 20
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

const stopPlaces = {
  kvaernerbyen: "NSR:StopPlace:6552",
  kvaerner: "NSR:StopPlace:6555",
} as const;
const queries = () => {
  return Object.values(stopPlaces).map(async (stopPlace) => {
    return client.request(stopPlaceQuery, {
      stopPlaceId: stopPlace,
      startTime: new Date().toISOString(),
    });
  });
};
export const GET = async () => {
  const data = await Promise.all(queries());

  return new Response(JSON.stringify(data));
};
