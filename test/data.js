module.exports = {
    UserMessages: [
        {
            subject: '0000000000000001',
            object: 1,
            readTime: 1516538014
        },
        {
            subject: '0000000000000001',
            object: 2,
            readTime: 1516538014
        }
    ],
    Messages: [{
            id: 1,
            title: "hello",
            content: "hey",
            sendTime: 1516538014
        }, {
            id: 2,
            title: "Fuck off",
            content: "....",
            sendTime: 1516538014
        }
    ],
    Users: [{
        id: '0000000000000001',
        name: 'Cindy',
        gender: 0,
        location: {
            lng: '113.46',
            lat: '22.27'
        },
        isVip: false,
        friends: []
    }, {
        id: '0000000000000002',
        name: 'Jessica',
        gender: 0,
        location: {
            lng: '122.67',
            lat: '23.45'
        },
        isVip: true,
        friends: [{
            fid: '0000000000000003',
            time: 1516538014
        }]
    }, {
        id: '0000000000000003',
        name: 'Ken',
        gender: 1,
        location: {
            lng: '122.67',
            lat: '23.45'
        },
        isVip: true,
        friends: [{
            fid: '0000000000000001',
            time: 1516538014
        }, {
            fid: '0000000000000002',
            time: 1516538015
        }]
    }]
}