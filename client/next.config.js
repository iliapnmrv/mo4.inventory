/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        appDir: true,
    },
    images: {
        domains: ['mo4-web', 'localhost']
    },
    basePath: '/inventory',
    // assetPrefix: '/inventory',
    // async redirects() {
    //     return ([{
    //         source: '/',
    //         destination: '/inventory',
    //         permanent: true,
    //         basePath: false,
    //     }, {
    //         source: '/catalogs',
    //         destination: '/inventory/catalogs',
    //         permanent: true,
    //         basePath: false,
    //     }, {
    //         source: '/inv',
    //         destination: '/inventory/inv',
    //         permanent: true,
    //         basePath: false,
    //     }, ]);
    // }

}

module.exports = nextConfig