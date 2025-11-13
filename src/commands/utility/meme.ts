const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder().setName('meme').setDescription('Responds with a random meme'),
    async execute(interaction: { reply: (arg0: string) => any; }) {

        type MemeResponse = {
            success: boolean,
            data: {
                memes: Meme[]
            }
        }

        type Meme = {
            id: number,
            name: string,
            url: string,
            width: number,
            height: number
            box_count: number
        }

        const memeList = await fetch('https://api.imgflip.com/get_memes')
            .then(res => res.json())
            .then(res => (res as MemeResponse).data.memes);

        const random = Math.floor(Math.random() * memeList.length);

        const selectedMeme = memeList[random];

        const canvas = Canvas.createCanvas(selectedMeme.width, selectedMeme.height);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage(selectedMeme.url);
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'random-meme.png'});

        await interaction.reply({files: [attachment]});
    },
};
