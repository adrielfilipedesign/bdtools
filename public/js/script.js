// Função para carregar o JSON de atributos e injetar no HTML
async function loadAttributes() {
    try {
        const response = await fetch('public/json/attributes.json');
        const data = await response.json();

        const leftside = data.leftside;
        const rightside = data.rightside;
        const container = document.getElementById('container');

        leftside.forEach((attribute, index) => {
            // Criar container para cada atributo
            const attributeContainer = document.createElement('div');
            attributeContainer.classList.add('attribute-container');
            container.appendChild(attributeContainer);

            // Criar rótulo esquerdo
            const leftLabel = document.createElement('div');
            leftLabel.classList.add('label');
            leftLabel.textContent = attribute;

            // Criar barra de atributos
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.id = `bar-${index}`;

            // Criar indicador
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.id = `indicator-${index}`;
            bar.appendChild(indicator);

            // Criar marcas magnéticas
            const magneticPositions = [0, 16.6, 33.3, 50, 66.6, 83.3, 100];
            magneticPositions.forEach((position) => {
                const marker = document.createElement('div');
                marker.classList.add('magnetic-marker');
                marker.style.left = `${position}%`;
                bar.appendChild(marker);
            });

            // Criar rótulo direito
            const rightLabel = document.createElement('div');
            rightLabel.classList.add('label');
            rightLabel.textContent = rightside[index];

            // Adicionar elementos ao container
            attributeContainer.appendChild(leftLabel);
            attributeContainer.appendChild(bar);
            attributeContainer.appendChild(rightLabel);

            // Definir posição inicial no ponto 4 (50%)
            indicator.style.left = "50%";

            // Função para movimentar o indicador e atualizar os resultados
            function setIndicatorPosition(event) {
                const barRect = bar.getBoundingClientRect();
                let newLeft = event.clientX - barRect.left;

                newLeft = Math.max(0, Math.min(newLeft, barRect.width));

                let closestPosition = magneticPositions.reduce((prev, curr) => {
                    return (Math.abs(curr - (newLeft / barRect.width) * 100) < Math.abs(prev - (newLeft / barRect.width) * 100)) ? curr : prev;
                });

                indicator.style.left = `${closestPosition}%`;
                updateResults();
            }

            // Lógica de arraste
            let dragging = false;

            bar.addEventListener('mousedown', (event) => {
                dragging = true;
                setIndicatorPosition(event);
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', (event) => {
                if (dragging) {
                    setIndicatorPosition(event);
                }
            });

            document.addEventListener('mouseup', () => {
                dragging = false;
                document.body.style.userSelect = 'auto';
            });

            bar.addEventListener('click', (event) => {
                if (!dragging) {
                    setIndicatorPosition(event);
                }
            });
        });

        updateResults();
    } catch (error) {
        console.error('Erro ao carregar o arquivo JSON:', error);
    }
}

// Atualiza os resultados na tela
function updateResults() {
    let results = [];

    document.querySelectorAll('.bar').forEach((bar, index) => {
        const indicator = document.getElementById(`indicator-${index}`);
        const leftLabel = bar.previousElementSibling.textContent;
        const rightLabel = bar.nextElementSibling.textContent;

        // Converte os atributos para suas iniciais
        const leftInitial = leftLabel.charAt(0).toUpperCase();
        const rightInitial = rightLabel.charAt(0).toUpperCase();

        // Obtém a posição do indicador e converte para uma escala de 1 a 7
        let positionPercent = parseFloat(indicator.style.left);
        let positionIndex = Math.round((positionPercent / 100) * 6) + 1; // Converte para escala 1-7

        results.push(`${leftInitial}${rightInitial}${positionIndex}`);
    });

    // Exibe o resultado final
    const resultText = results.join("-");
    document.getElementById('result-text').textContent = resultText;

    // Verifica se o resultado inserido é igual ao gerado
    document.getElementById('result-input').value = resultText; // Insere o resultado gerado no campo de entrada
}

// Função para aplicar o resultado inserido no campo de entrada
function applyResult() {
    const resultText = document.getElementById('result-input').value.trim();

    if (!resultText) {
        alert("Por favor, insira um resultado.");
        return;
    }

    // Limpa as barras e indicadores antes de aplicar o novo resultado
    clearIndicators();

    // O formato esperado é: TM4-SD4-AE4-FM4-JM4-DO4-TI4-RD4-LP4-AI4-DR4-CD4
    const results = resultText.split("-").map(result => result.trim());

    // Para cada barra, associamos o resultado correspondente
    results.forEach((result, index) => {
        const leftRightPair = result.substring(0, 2);  // Ex: 'TM' (Tradicional-Moderna)
        const positionIndex = parseInt(result.charAt(2)); // Posição: 1, 2, 3, ...

        // Encontra os rótulos dos atributos
        const leftInitial = leftRightPair.charAt(0); // Ex: 'T' (Tradicional)
        const rightInitial = leftRightPair.charAt(1); // Ex: 'M' (Moderna)

        const leftLabel = leftside.find(label => label.charAt(0) === leftInitial);
        const rightLabel = rightside.find(label => label.charAt(0) === rightInitial);

        // Se os rótulos forem encontrados
        if (leftLabel && rightLabel && positionIndex >= 1 && positionIndex <= 7) {
            // Encontra a barra correspondente
            const bar = document.getElementById(`bar-${index}`);
            const indicator = document.getElementById(`indicator-${index}`);
            
            // Define a posição do indicador com base na posição fornecida
            const magneticPositions = [0, 16.6, 33.3, 50, 66.6, 83.3, 100];
            const position = magneticPositions[positionIndex - 1]; // Converte para índice da lista (0-6)

            // Atualiza a posição do indicador
            indicator.style.left = `${position}%`;

            // Atualiza os rótulos
            const leftLabelElement = bar.previousElementSibling;
            const rightLabelElement = bar.nextElementSibling;

            leftLabelElement.textContent = leftLabel;
            rightLabelElement.textContent = rightLabel;
        }
    });
}

// Função para limpar os indicadores antes de aplicar um novo resultado
function clearIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        indicator.style.left = '0%';  // Reseta a posição para o começo
    });

    // Reseta os rótulos
    const leftLabels = document.querySelectorAll('.attribute-container .label');
    leftLabels.forEach(label => {
        label.textContent = '';
    });

    const rightLabels = document.querySelectorAll('.attribute-container .label');
    rightLabels.forEach(label => {
        label.textContent = '';
    });
}

function getResultFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('result');
}

function applyResultFromUrl(resultText) {
    if (!resultText) return;

    // Limpa os indicadores antes de aplicar o novo resultado
    clearIndicators();

    // Divide o resultado em partes e aplica cada uma
    const results = resultText.split("-");

    results.forEach((result, index) => {
        const leftRightPair = result.substring(0, 2);  // Ex: 'TM' (Tradicional-Moderna)
        const positionIndex = parseInt(result.charAt(2)); // Posição: 1, 2, 3, ...

        // Encontra os rótulos dos atributos
        const leftInitial = leftRightPair.charAt(0); // Ex: 'T' (Tradicional)
        const rightInitial = leftRightPair.charAt(1); // Ex: 'M' (Moderna)

        const leftLabel = leftside.find(label => label.charAt(0) === leftInitial);
        const rightLabel = rightside.find(label => label.charAt(0) === rightInitial);

        // Se os rótulos forem encontrados
        if (leftLabel && rightLabel && positionIndex >= 1 && positionIndex <= 7) {
            // Encontra a barra correspondente
            const bar = document.getElementById(`bar-${index}`);
            const indicator = document.getElementById(`indicator-${index}`);

            // Define a posição do indicador com base na posição fornecida
            const magneticPositions = [0, 16.6, 33.3, 50, 66.6, 83.3, 100];
            const position = magneticPositions[positionIndex - 1]; // Converte para índice da lista (0-6)

            // Atualiza a posição do indicador
            indicator.style.left = `${position}%`;

            // Atualiza os rótulos
            const leftLabelElement = bar.previousElementSibling;
            const rightLabelElement = bar.nextElementSibling;

            leftLabelElement.textContent = leftLabel;
            rightLabelElement.textContent = rightLabel;
        }
    });

    // Atualiza os resultados após aplicar os valores da URL
    updateResults();
}

// Função para copiar o resultado para a URL
function copyResult() {
    const resultText = document.getElementById('result-text').textContent;

    // Verifica se há um resultado gerado
    if (!resultText) {
        alert('Nenhum resultado gerado!');
        return;
    }

    // Cria a URL completa com o resultado como parâmetro
    const currentUrl = window.location.href.split('?')[0]; // Pega a URL sem parâmetros
    const newUrl = `${currentUrl}?result=${encodeURIComponent(resultText)}`;

    // Cria um campo temporário para copiar a URL
    const tempInput = document.createElement('input');
    tempInput.value = newUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    alert('URL com o resultado copiada para a área de transferência!');
}




// Chama a função ao carregar a página
loadAttributes();
