/**
 * This example demonstrates using polling.
 * It also demonstrates how you would process and send messages.
 */


const TOKEN = '1700851435:AAGc9OzdRRtAaaf0w-9ZH2FNrNYlk60RsUw';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const base_url = 'https://baraka-shop.uz/api/'
const axios = require('axios').default
const checkoutStatuses = {not_saled: 4, saled: 5, deliving: 6, ignore: 7}
let products = null
const options = {
    polling: true
};
const bot = new TelegramBot(TOKEN, options);


// Matches /photo
// bot.onText(/\/photo/, function onPhotoText(msg) {
//     // From file path
//     const photo = `${__dirname}/../test/data/photo.gif`;
//     bot.sendPhoto(msg.chat.id, photo, {
//         caption: "I'm a bot!"
//     });
// });


// Matches /audio
bot.onText(/\/audio/, function onAudioText(msg) {
    // From HTTP request
    const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
    const audio = request(url);
    bot.sendAudio(msg.chat.id, audio);
});


// bot.on('message', function (msg) {
//
//     let url = msg.text
//     let video_id = url.split('v=')[1]
//     let chatId = msg.chat.id
//     let options = {
//         method: 'GET',
//         url: 'https://youtube-to-mp32.p.rapidapi.com/yt_to_mp3',
//         params: {video_id: video_id},
//         headers: {
//             'x-rapidapi-key': 'a3a992e790mshfa58ba06fae1a0cp1de026jsna9c9e85c027d',
//             'x-rapidapi-host': 'youtube-to-mp32.p.rapidapi.com'
//         }
//     };
//
//     axios.request(options).then(function (response) {
//         const url = response.data.Download_url;
//         const audio = request(url);
//         bot.sendAudio(chatId, audio, {
//             title: response.data.Title
//         });
//     }).catch(function (error) {
//         bot.sendMessage(chatId, "Youtube url linkida xatolik mavjud!")
//     })
// })


// Matches /love
bot.onText(/\/start/, function onLoveText(msg) {
    bot.sendMessage(msg.chat.id, 'Salom!', {
        "reply_markup": {
            "inline_keyboard": [[
                {
                    "text": "Zakazlar",
                    "callback_data": "checkouts"
                },
                {
                    "text": "Tovarlar",
                    "callback_data": "products"
                }
            ]
            ]
        }
    });
});


// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
    const resp = match[1];
    bot.sendMessage(msg.chat.id, resp);
});


// Matches /editable
bot.onText(/\/editable/, function onEditableText(msg) {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Edit Text',
                        // we shall check for this value when we listen
                        // for "callback_query"
                        callback_data: 'edit'
                    }
                ]
            ]
        }
    };
    bot.sendMessage(msg.from.id, 'Original Text', opts);
});


// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: 'HTML'
    };
    let text;

    if (action.split('/')[0] === 'checkout_accepted'){
        axios.get(base_url + action).then(res => {
            bot.sendMessage(msg.chat.id, 'Zakaz qabul qilindi.')
        }).catch(err => {
            console.log(err)
        })
    }

    if (action.split('/')[0] === 'checkout_salling'){
        axios.get(base_url + action).then(res => {
        }).catch(err => {
            console.log(err)
        })
    }

    if (action.split('/')[0] === 'checkout_saled'){
        axios.get(base_url + action).then(res => {
        }).catch(err => {
            console.log(err)
        })
    }


    if (action === 'products') {

        axios.get(base_url + action).then(res => {
            console.log(res.data)
            products = res.data.data
            let text = ''
            bot.sendMessage(msg.chat.id, '<strong>Tovarlar</strong>', {parse_mode: 'HTML'})
            for (let i = 0; i < products.length; i++) {
                text += products[i].id + '. ' + products[i].name + ', ' + products[i].price + ' so\'m' + ', ' + products[i].count + ' ta \n'
            }
            bot.sendMessage(msg.chat.id, text)
        }).catch(err => {
            console.log(err)
        })
    }
    if (action === 'checkouts') {
        bot.sendMessage(msg.chat.id, 'Zakazlar turini tanlang', {
            "reply_markup": {
                "inline_keyboard": [[
                    {
                        "text": "Yetkazib berilgan",
                        "callback_data": "checkouts/" + checkoutStatuses.saled,
                    },
                    {
                        "text": "Yetkazilayotgan",
                        "callback_data": "checkouts/" + checkoutStatuses.deliving
                    },
                    {
                        "text": "Bekor qilingan",
                        "callback_data": "checkouts/" + checkoutStatuses.ignore
                    },
                    {
                        "text": "Qabul qilingan",
                        "callback_data": "checkouts/" + checkoutStatuses.not_saled
                    }
                ]]
            }
        })
    }

    if (action.split('/')[0] === 'checkouts' && action.split('/')[1] !== null) {
        let checkouts = null
        axios.get(base_url + action).then(res => {
            checkouts = res.data.data
            bot.sendMessage(msg.chat.id, '<strong>Zakazlar</strong>', {parse_mode: 'HTML'})
            for (let i = 0; i < checkouts.length; i++) {

                let text = '<strong>ID:</strong> ' + checkouts[i].id  + '\n' +
                    '<strong>Address:</strong> ' + checkouts[i].region.name + ',' + checkouts[i].address + '\n' +
                    '<strong>Telefon raqam:</strong> ' + checkouts[i].phone + '\n' +
                    '<strong>Ismi:</strong> ' + checkouts[i].name + '\n' +
                    '<strong>Summa:</strong> ' + checkouts[i].amount + '\n' +
                    '<strong>Soni:</strong> ' + checkouts[i].count + '\n' +
                    '<strong>Vaqt:</strong> ' + checkouts[i].created_at.split('.')[0] + '\n' +
                    '<strong>Status:</strong> ' + checkouts[i].with_status.description + '\n'

                // let text = checkouts[i].id + '. ' + checkouts[i].region.name + ', ' + checkouts[i].phone + ', '
                //     + checkouts[i].name + ', ' + checkouts[i].amount + ' so\'m, ' + checkouts[i].count + ', '
                //     + checkouts[i].created_at + ', ' + checkouts[i].with_status.description + '\n'

                let opts = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Sotildi',
                                    callback_data: 'edit'
                                },
                                {
                                    text: 'Yetkazilmoqda',
                                    callback_data: 'edit'
                                },
                                {
                                    text: 'Bekor qilish',
                                    callback_data: 'edit'
                                }
                            ]
                        ]
                    }
                };
                bot.sendMessage(msg.chat.id, text, opts)
            }
            console.log(checkouts)
            bot.sendMessage(msg.chat.id, JSON.stringify(checkouts))
            console.log(text)
        }).catch(err => {
            console.log(JSON.stringify(err))
        })


    }
});


function getCheckouts(action) {
    let response = null
    axios.get(base_url + action).then(res => {
        response = res
    })
    return response
}