// app/api/generate/route.ts
import axios from 'axios';
import FormData from 'form-data';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = "experimental-edge"

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // Assuming the body is a FormData object. Adjust as necessary for your use case.
  const formData = await req.formData();
  const prompt = formData.get('prompt');
  const negativePrompt = formData.get('negative_prompt');
  const aspectRatio = formData.get('aspect_ratio');
  const model = 'sd3'; // Static value as example
  const outputFormat = 'jpeg'; // Static value as example

  const apiFormData = new FormData();
  apiFormData.append('prompt', prompt?.toString());
  apiFormData.append('negative_prompt', negativePrompt?.toString());
  apiFormData.append('model', model);
  apiFormData.append('aspect_ratio', aspectRatio?.toString());
  apiFormData.append('output_format', outputFormat);

  try {
    const apiResponse = await axios.post('https://api.stability.ai/v2beta/stable-image/generate/sd3', apiFormData, {
      headers: {
        ...apiFormData.getHeaders(),
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      responseType: 'arraybuffer'
    });

    // Convert array buffer response to blob for NextResponse
    const blob = new Blob([apiResponse.data], { type: 'image/jpeg' });
    return new NextResponse(blob);
  } catch (error: any) {
    console.error('API call failed:', error);
    return new NextResponse(`Failed to generate image: ${error.message}`, { status: 500 });
  }
}