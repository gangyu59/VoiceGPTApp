// GPTService.js

async function getGPTResponse(userInput) {
    const apiKey = '84fba46b577b46f58832ef36527e41d4'; // 替换成你的 API 密钥
    const url = 'https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01';

    const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,  // 这里直接传入你的 API 密钥
    };

    const body = JSON.stringify({
        model: 'gpt-4o',  // 使用 gpt-4o 模型
        messages: [
            {
                role: 'user',
                content: userInput
            }
        ],
        max_tokens: 1000,
        temperature: 0.7
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            console.error("Error fetching data from GPT:", response.status, response.statusText);
            throw new Error('API 请求失败');
        }

        const data = await response.json();
        const gptReply = data.choices[0].message.content.trim();

        // 将 GPT 回复显示在页面
        document.getElementById('chat-box').innerHTML += `<div class="gpt-message"><strong>GPT:</strong> ${gptReply}</div>`;

        // 将 GPT 回复转为语音
        textToSpeech(gptReply);

    } catch (error) {
        console.error("fetchGPTResponse error:", error);
        // 错误处理显示
        document.getElementById('chat-box').innerHTML += `<div class="gpt-message"><strong>GPT:</strong> 抱歉，发生错误！</div>`;
    }
}