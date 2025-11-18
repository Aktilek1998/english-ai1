// API шақыруларды басқару
let lastAPICallTime = 0;
const MIN_TIME_BETWEEN_CALLS = 2000; // 2 секунд

async function getAIResponse(message) {
    if (!OPENAI_API_KEY) {
        return "Өтінемін, алдымен API кілтін енгізіңіз. Үстіңгі оң жақтағы 'API Кілт' түймесін басыңыз.";
    }

    // Жиілік шектеуін тексеру
    const now = Date.now();
    const timeSinceLastCall = now - lastAPICallTime;
    
    if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
        const waitTime = MIN_TIME_BETWEEN_CALLS - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
        lastAPICallTime = Date.now();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Сен EnglishAI ботсың - ағылшын тілін үйрететін AI көмекшісі. 
                                Сен қазақ тілінде жауап бересің.
                                Сенің мақсатың - ағылшын тілін үйренуге көмектесу.
                                Жауаптарың білім беретін, пайдалы және достық болуы керек.
                                Ағылшын тілінің грамматикасын, сөздік қорын, сөйлеу дағдыларын үйрет.
                                Мысалдар мен тәжірибелер ұсын.
                                Жауабың ұзындығы 100-300 сөз аралығында болуы керек.`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
        }

        if (!response.ok) {
            throw new Error(`API қатесі: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('API қатесі:', error);
        
        if (error.message.includes('Rate limit')) {
            return `😅 Тым жиі сұрау жіберіп тұрсыз! 10 секунд күтіп, қайталап көріңіз.\n\nЕгер бұл қате жиі болып тұрса, келесі әрекеттерді орындаңыз:\n• Бірнеше минут күтіңіз\n• API кілтіңізді тексеріңіз\n• Төменгі модельге ауысыңыз (gpt-3.5-turbo)`;
        }
        
        return `Кешіріңіз, қазір жауап бере алмаймын. Қате: ${error.message}`;
    }
}