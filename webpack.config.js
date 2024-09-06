export default () => {
    return {
        mode: "production",
        entry: {
            "index.js": "./src/index.ts"
        },
        output: {
            filename: "[name]",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader"
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"]
        }
    }
};
