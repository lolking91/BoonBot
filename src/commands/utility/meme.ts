const {SlashCommandBuilder, AttachmentBuilder} = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder().setName('meme')
        .setDescription('Responds with a random meme')
        .addStringOption((option: any) => option.setName('tags').setDescription('tags which describes a meme').setRequired(true)),
    async execute(interaction: { reply: (arg0: string) => any; options: any }) {

        type MemeResponse = {
            id: number,
            created_at: string,
            blob_url: string,
            tags: string[],
        }

        const tags: string[] = interaction.options.getString('tags');

        const tagsAppendix = 'tags=' + tags.map(tag => '&tags=' + tag);

        console.log('tagAppendix', tagsAppendix);

        const response = await fetch(`https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`)
            .then(res => res.json() as unknown as MemeResponse);

        const canvas = Canvas.createCanvas(200, 200);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage(response.blob_url);
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        // Use the helpful Attachment class structure to process the file for you
        const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'random-meme.png'});

        await interaction.reply({files: [attachment]});
    },
};
