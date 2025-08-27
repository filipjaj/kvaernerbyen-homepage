import posthog from "posthog-js";
import { browser } from "$app/environment";

export const load = async () => {
  if (browser) {
    posthog.init("phc_4V6brcEItxlEYjT0R92IR6PBbJU7xIz8e5h1cjQczCp", {
      api_host: "https://eu.i.posthog.com",
      defaults: "2025-05-24",
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });
  }

  return;
};
