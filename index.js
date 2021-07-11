/**
 * This example demonstrates using polling.
 * It also demonstrates how you would process and send messages.
 */


const TOKEN = '1897366198:AAFY-HfEqz_-HoZZC14uDJPlJDyNErz9m94';
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const axios = require('axios').default
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


bot.on('message', function (msg) {

    let url = msg.text
    let video_id = url.split('v=')[1]
    let chatId = msg.chat.id
    let options = {
        method: 'GET',
        url: 'https://youtube-to-mp32.p.rapidapi.com/yt_to_mp3',
        params: {video_id: video_id},
        headers: {
            'x-rapidapi-key': 'a3a992e790mshfa58ba06fae1a0cp1de026jsna9c9e85c027d',
            'x-rapidapi-host': 'youtube-to-mp32.p.rapidapi.com'
        }
    };

    axios.request(options).then(function (response) {
        const url = response.data.Download_url;
        const audio = request(url);
        bot.sendAudio(chatId, audio, {
            title: response.data.Title
        });
    }).catch(function (error) {
        bot.sendMessage(chatId, "Youtube url linkida xatolik mavjud!")
    })
})


// Matches /love
bot.onText(/\/start/, function onLoveText(msg) {
    bot.sendMessage(msg.chat.id, 'Salom Youtubdagi video linkini jo\'nating?');
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

    if (action === 'edit') {
        text = '<i>daaaaaaaaaaaaaaa</i><pre>dask; dasdasdklasd  dasd' +
            'dasdasd' +
            'asd' +
            'asasd' +
            'asd</pre>'
    }

    bot.editMessageText(text, opts);
});