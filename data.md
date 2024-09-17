```javascript
let data = {
    users: [
        {
            uId: 1,
            nameFirst: 'Rani',
            nameLast: 'Jiang',
            email: 'ranivorous@gmail.com',
        },
        {
            uId: 65,
            nameFirst: 'joea',
            nameLast: 'lka',
            email: 'joea@gmail.com',
        },
        {
            uId: 1001010101001,
            nameFirst: 'joeb',
            nameLast: 'lkb',
            email: 'joeb@gmail.com',
        },
        {
            uId: -1111111111,
            nameFirst: 'joec',
            nameLast: 'lkc',
            email: 'joec@gmail.com',
        },
        {
            uId: 0,
            nameFirst: 'joed',
            nameLast: 'lkd',
            email: 'joed@gmail.com',
        },
        {
            uId: 2, 
            nameFirst: 'joee',
            nameLast: 'lke',
            email: 'joee@gmail.com',
        },
        {
            uId: 3,
            nameFirst: 'joef',
            nameLast: 'lkf',
            email: 'joef@gmail.com',
        }
    ],

    quizes: [
        {
            quizId: 1,
            name: 'My Quiz',
            timeCreated: 1683125870,
            timeLastEdited: 1683125871,
            description: 'This is my quiz',
        },
        {
            quizId: 10001001917474,
            name: 'My Quiz a',
            timeCreated: 15645,
            timeLastEdited: 16871,
            description: 'This is my quiz',
        },
        {
            quizId: -118726498721631234,
            name: 'My Quiz b',
            timeCreated: 125870,
            timeLastEdited: 25871,
            description: 'This is my quiz',
        },
        {
            quizId: 0,
            name: 'My Quiz c',
            timeCreated: 12223470,
            timeLastEdited: 12323125871,
            description: 'This is my quiz',
        },
        {
            quizId: 2, 
            name: 'My Quiz d',
            timeCreated: 1683126000, 
            timeLastEdited: 1683126001, 
            description: 'This is my quiz d',
        },
        {
            quizId: 3,
            name: 'My Quiz e',
            timeCreated: 1683127000, 
            timeLastEdited: 1683127001, 
            description: 'This is my quiz e',
        }
    ]
}
```

[Optional] description: very good layout of data, consideration of every 
possibility and edge cases. for easy tracking we have named users and quizes in 
alphabetical order, relative to quizes this is what the data will look like 
with multiple quizes. 
