export type MemeResponse = {
    success: boolean,
    data: {
        memes: Meme[]
    }
}

export type Meme = {
    id: number,
    name: string,
    url: string,
    width: number,
    height: number
    box_count: number
}
