module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    overrides: [
        {
            extends: [
                "airbnb",
                "airbnb-typescript",
                "airbnb/hooks",
                "prettier",
            ],
            parserOptions: {
                project: "./tsconfig.json",
            },
            files: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/no-shadow": ["error"],
                "no-shadow": "off",
                "no-undef": "off",
                "sort-imports": "off",
                "import/no-mutable-exports": "off",
                "no-await-in-loop": "off",
                "prettier/prettier": ["error"],
                "import/order": "off",
                "@typescript-eslint/no-loop-func": "off",
                "no-restricted-syntax": "off",
                "prefer-destructuring": "off",
                "no-plusplus": "off",
                "class-methods-use-this": "off",
                "react/destructuring-assignment": "off",
                "react/jsx-no-constructed-context-values": "off",
                "react/jsx-props-no-spreading": "off",
                "jsx-a11y/anchor-is-valid": "off",
                "react/no-unescaped-entities": "off",
                "no-underscore-dangle": "off",
                "react/no-unstable-nested-components": [
                    "error",
                    {
                        allowAsProps: true,
                    },
                ],
                "react/function-component-definition": [
                    "error",
                    {
                        namedComponents: [
                            "function-declaration",
                            "arrow-function",
                        ],
                        unnamedComponents: "arrow-function",
                    },
                ],
                "import/extensions": [
                    "error",
                    "ignorePackages",
                    {
                        js: "never",
                        jsx: "never",
                        ts: "never",
                        tsx: "never",
                    },
                ],
                "import/no-extraneous-dependencies": [
                    "error",
                    {
                        devDependencies: false,
                        optionalDependencies: false,
                        peerDependencies: false,
                    },
                ],
            },
        },
    ],
};
