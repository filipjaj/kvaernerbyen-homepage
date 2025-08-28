import { site } from "$lib/config";
import type { RequestHandler } from "@sveltejs/kit";
import { GraphQLClient, gql } from "graphql-request";

const baseUrl = "https://api.entur.io/journey-planner/v3/graphql";

const client = new GraphQLClient(baseUrl, {
  headers: {
    "ET-Client-Name": site.entur.clientName,
  },
});

const bysykkelQuery = gql`
  query Bikes($id: String!) {
    bikeRentalStation(id: $id) {
      id
      spacesAvailable
      realtimeOccupancyAvailable
      bikesAvailable
      name
    }
  }
`;
export type BysykkelResponse = {
  data: {
    bikeRentalStation: {
      id: string;
      spacesAvailable: number;
      realtimeOccupancyAvailable: boolean;
      bikesAvailable: number;
      name: string;
    };
  };
};

export const GET: RequestHandler = async () => {
  try {
    if (!site.mobility.bysykkel.id) {
      throw new Error("No bike station ID found");
    }
    const data = await client.request(bysykkelQuery, {
      id: site.mobility.bysykkel.id,
    });
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[bikes endpoint] Error fetching from Entur Mobility:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch bikes", message }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
