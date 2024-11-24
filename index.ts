import express from 'express';
import cors from 'cors';
const PORT = process.env.PORT || 3000;
let data: Object = {};

const app = express();
app.use(cors());

async function getSong() {
    try {
        const response = await fetch(`${process.env.HA_API_URL}/api/states/${process.env.HA_ENTITY_ID}`, {
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

async function formatData(data: any) {
    if (!data || !data.attributes) {
        console.error('Invalid data received');
        return null;
    }
    const image = await getSongImage(data.attributes.entity_picture);

    const formatData = {
        state: data.state,
        artist: data.attributes.media_artist,
        title: data.attributes.media_title,
        album: data.attributes.media_album_name,
        image: image,
        duration: data.attributes.media_duration,
        progress: data.attributes.media_position,
        progress_date: data.attributes.media_position_updated_at,
        id: data.attributes.media_content_id
    }

    return formatData;
}

app.get('/', async (req, res) => {
    res.json(data);
});

setInterval(async () => {
    const formattedData = await formatData(await getSong());
    if (formattedData) {
        data = formattedData;
    }
}, 10000);

const formattedData = await formatData(await getSong());
if (formattedData) {
    data = formattedData;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function getSongImage(entity_picture: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!entity_picture) {
            return resolve('');
        }

        fetch(`${process.env.HA_API_URL}${entity_picture}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.HA_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.blob())
        .then(async blob => {
            const buffer = Buffer.from(await blob.arrayBuffer());
            const base64 = buffer.toString('base64');
            resolve(`data:${blob.type};base64,${base64}`);
        })
        .catch(reject);
    });
}