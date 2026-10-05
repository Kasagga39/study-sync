import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    slate: "#30343F",
                    bg: "#FAFAFF",
                    accent: "#E4D9FF",
                    primary: "#273469",
                    navy: "#1E2749",
                },
            },
        },
    },
    plugins: [],
};
export default config;