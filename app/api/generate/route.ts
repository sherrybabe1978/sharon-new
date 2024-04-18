// app/api/generate/route.ts
import axios from 'axios';
import FormData from 'form-data';
import { NextResponse } from 'next/server';

// Change `export default async function handler` to:
export async function POST(req: Request) {
  // Assuming the request Content-Type is 'application/json' for simplicity
  const data = await req.json();
  const formData = new FormData();
  formData.append('prompt', data.prompt);
  formData.append('negative_prompt', data.negativePrompt);
  formData.append('model', 'sd3');
  formData.append('aspect_ratio', data.aspectRatio);
  formData.append('output_format', 'jpeg');

  try {
    const apiResponse = await axios.post('https://api.stability.ai/v2beta/stable-image/generate/sd3', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      responseType: 'arraybuffer'
    });

    // Use NextResponse to send back the binary data
    return new NextResponse(apiResponse.data, {
      status: apiResponse.status,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (error) {
    console.error('API call failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate image' }), { status: 500 });
  }
}