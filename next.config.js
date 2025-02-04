/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        /* remotePatterns doesn't work for some reason */
        /*remotePatterns: [
            {
                protocol: "https",
                hostname: "secure.gravatar.com",
                port: "",
                pathname: "/avatar/*",
                search: "*",
            }
        ],*/
        domains: ["secure.gravatar.com"],
    }
};

export default config;
