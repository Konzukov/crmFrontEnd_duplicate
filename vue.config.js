module.exports = {
    transpileDependencies: [
        "vuetify",
    ],
    devServer: {
        disableHostCheck: true,
        proxy: 'http://127.0.0.1:8181'
    },
}