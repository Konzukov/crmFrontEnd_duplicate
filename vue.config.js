module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        disableHostCheck: true,
        // proxy: 'http://api.planer-studio.ru:8181'
        proxy: 'http://127.0.0.1:8181'
    },
    // publicPath: process.env.NODE_ENV === 'production' ? '/var/www/www-root/data/www/crm.planer-studio.ru/' : '/'
}