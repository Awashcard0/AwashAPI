import { fetch } from "bun";

async function getSong() {
    try {
        const response = await fetch(`${process.env.HA_API_URL}/states/${process.env.HA_ENTITY_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.HA_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

function formatData(data: any) {
    let formatData = {
        state: data.state,
        artist: data.attributes.media_artist,
        title: data.attributes.media_title,
        album: data.attributes.media_album_name,
        image: data.attributes.entity_picture,
        duration: data.attributes.media_duration,
        progress: data.attributes.media_position,
        id: data.attributes.media_content_id,
        repeat: data.attributes.repeat,
        shuffle: data.attributes.shuffle
    }

    return formatData;
}

console.log(formatData(await getSong()));