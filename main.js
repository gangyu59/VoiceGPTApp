// 获取页面元素
const languageSelect = document.createElement('select');
languageSelect.id = 'language-select';

// **调整样式，使其放大 30% 并居中**
languageSelect.style.fontSize = '130%';
languageSelect.style.padding = '10px';
languageSelect.style.marginTop = '10px';
languageSelect.style.display = 'block';
languageSelect.style.textAlign = 'center';
languageSelect.style.width = '50%'; // 控制宽度
languageSelect.style.marginLeft = 'auto';
languageSelect.style.marginRight = 'auto';

// 添加语言选项
const languages = {
    'zh-CN': '中文',
    'en-US': 'English',
    'es-ES': 'Español',
		'ja-JP': '日本语',
    'fr-FR': 'Français'
};

for (const [code, name] of Object.entries(languages)) {
    let option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    languageSelect.appendChild(option);
}

// **监听语言切换**
languageSelect.addEventListener('change', function () {
    setRecognitionLanguage(languageSelect.value);
});

// **插入到页面（放在麦克风按钮下方）**
const controls = document.getElementById('controls');
controls.appendChild(languageSelect);

const micButton = document.getElementById('start-btn');
const chatBox = document.getElementById('chat-box');

// 维护对话历史
let conversationHistory = [];

// 进度条
let progressBar = document.createElement('progress');
progressBar.id = 'speech-progress';
progressBar.value = 0;
progressBar.max = 100;
progressBar.style.display = 'none';
progressBar.style.height = '6px';
progressBar.style.border = 'none';
progressBar.style.position = 'relative';

// 进度条必须在 `chatBox` 内部，以便每次更新宽度
chatBox.appendChild(progressBar);

// 停止播放按钮
let stopButton = document.createElement('button');
stopButton.id = 'stop-btn';
stopButton.innerText = '⏹ 停止播放';
stopButton.style.display = 'none';
stopButton.style.fontSize = '130%';
stopButton.style.padding = '8px 12px';
stopButton.style.backgroundColor = 'red';
stopButton.style.color = 'white';
stopButton.style.border = 'none';
stopButton.style.borderRadius = '5px';
stopButton.style.cursor = 'pointer';
stopButton.style.height = micButton.offsetHeight + 'px';
stopButton.style.marginLeft = '10px';

// 将停止按钮放在麦克风按钮旁边
micButton.parentNode.insertBefore(stopButton, micButton.nextSibling);

// 监听麦克风按钮点击
micButton.addEventListener('click', function () {
    if (!micButton.disabled) {
        // 预加载空白语音，防止 Safari 阻止播放
        const tempSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(tempSpeech);

        startSpeechRecognition(handleUserSpeech);
    }
});

// 监听停止播放按钮
stopButton.addEventListener('click', function () {
    stopSpeechPlayback();
});

let micBlinkInterval = null; // 控制闪烁的定时器

// 放大麦克风 Icon 20%（初始化时执行一次）
const micIcon = micButton.querySelector('i') || micButton; // 查找按钮内的 icon
micIcon.style.fontSize = '130%'; // 放大

// 开始麦克风图标闪烁
function startMicBlinking() {
    micBlinkInterval = setInterval(() => {
        micIcon.style.opacity = (micIcon.style.opacity === '0.5') ? '1' : '0.5';
    }, 500); // 每 500ms 切换透明度，实现闪烁效果
}

// 停止麦克风图标闪烁
function stopMicBlinking() {
    clearInterval(micBlinkInterval);
    micIcon.style.opacity = '1'; // 还原为正常状态
}

// 监听麦克风按钮点击
micButton.addEventListener('click', function () {
    if (!micButton.disabled) {
        // 预加载空白语音，防止 Safari 阻止播放
        const tempSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(tempSpeech);

        startMicBlinking(); // 开始闪烁
        startSpeechRecognition(handleUserSpeech);
    }
});

// 处理用户语音输入（停止闪烁）
function handleUserSpeech(transcript) {
    stopMicBlinking(); // 用户输入结束后停止闪烁

    chatBox.innerHTML += `<div class="user-message"><strong>你:</strong> ${transcript}</div>`;
    scrollChatToBottom();

    // 记录用户输入到对话历史
    conversationHistory.push({ role: 'user', content: transcript });

    // 禁用麦克风 & 显示沙漏
    disableMic(true);
    showHourglass();

    fetchGPTResponse();
}

// **自动滚动聊天框到底部**
function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// GPT 交互
async function fetchGPTResponse() {
    const apiKey = '84fba46b577b46f58832ef36527e41d4'; // 替换为你的 API Key
    const url = 'https://gpt4-111-us.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-01';

    const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
    };

    const body = JSON.stringify({
        model: 'gpt-4o',
        messages: conversationHistory, // 发送完整的对话历史
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
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const gptReply = data.choices[0].message.content.trim();

        // 记录 GPT 回复到对话历史
        conversationHistory.push({ role: 'assistant', content: gptReply });

        // 确保 `hourglass` 只在 GPT 生成前出现
        hideHourglass();

        // 显示 GPT 回复
const messageDiv = document.createElement('div');
messageDiv.className = 'gpt-message';

// **使用 <pre> 保留 GPT 原始格式**
const messageContent = document.createElement('pre');
messageContent.className = 'gpt-text';
messageContent.textContent = `GPT: ${gptReply}`;

// **创建复制按钮**
const copyButton = document.createElement('button');
copyButton.innerHTML = '📋 复制'; // 直接使用通用复制图标
copyButton.classList.add('copy-btn');
copyButton.onclick = function () {
    copyToClipboard(gptReply);
};

// **将内容和按钮添加到 GPT 回复框**
messageDiv.appendChild(messageContent);
messageDiv.appendChild(copyButton);
chatBox.appendChild(messageDiv);
scrollChatToBottom();

        // 让进度条与最新的 GPT 回复对话框宽度一致
        progressBar.style.width = messageDiv.clientWidth + 'px';
        progressBar.style.display = 'block'; // 确保进度条出现

        // 播放 GPT 回复语音，并显示进度条和停止按钮
        textToSpeech(gptReply);

    } catch (error) {
        console.error("fetchGPTResponse error:", error);
        hideHourglass();
        chatBox.innerHTML += `<div class="gpt-message"><strong>GPT:</strong> 抱歉，发生错误！</div>`;
    }
}

// 语音合成
function textToSpeech(text) {
    if ('speechSynthesis' in window) {
        stopSpeechRecognition(); // **在朗读前停止语音识别，防止冲突**

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = selectedLanguage || 'zh-CN'; // 根据用户选择的语言朗读
        speech.rate = 1;
        speech.pitch = 1;

        // **优化特定语言的语音**
        const voices = speechSynthesis.getVoices();
        
        if (speech.lang === 'ja-JP') {
            // **日语使用 Kyoko 语音**
            speech.voice = voices.find(voice => voice.name.includes('Kyoko')) || speech.voice;
        } else if (speech.lang === 'en-US') {
            // **英语使用 Samantha 语音**
            speech.voice = voices.find(voice => voice.name.includes('Samantha')) || speech.voice;
        } else if (speech.lang === 'fr-FR') {
            // **法语使用 Thomas 语音**
            speech.voice = voices.find(voice => voice.name.includes('Thomas')) || speech.voice;
        } else if (speech.lang === 'es-ES') {
            // **西班牙语使用 Jorge 语音**
            speech.voice = voices.find(voice => voice.name.includes('Jorge')) || speech.voice;
        }

        // 显示进度条 & 停止按钮
        progressBar.style.display = 'block';
        stopButton.style.display = 'inline-block';
        progressBar.value = 0;

        let estimatedDuration = text.length * 80; // 估算语音时长（80ms/字符）
        let startTime = Date.now();

        let interval = setInterval(() => {
            let elapsedTime = Date.now() - startTime;
            progressBar.value = Math.min((elapsedTime / estimatedDuration) * 100, 100);
        }, 500);

        speech.onstart = function () {
            disableMic(true);
        };

        speech.onend = function () {
            disableMic(false);
            clearInterval(interval);
            progressBar.style.display = 'none';
            stopButton.style.display = 'none';
        };

        stopButton.onclick = function () {
            stopSpeechPlayback();
            clearInterval(interval);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    } else {
        console.error('语音合成不被支持');
    }
}

// 停止播放语音
function stopSpeechPlayback() {
    window.speechSynthesis.cancel();
    progressBar.style.display = 'none';
    stopButton.style.display = 'none';
    disableMic(false);
}

// 禁用/启用麦克风按钮
function disableMic(disabled) {
    micButton.disabled = disabled;
    micButton.style.opacity = disabled ? '0.5' : '1';
}

