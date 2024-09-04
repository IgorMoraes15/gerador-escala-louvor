const fs = require('fs');

const musicians = {
    fixed: ['Igor', 'Alessandro', 'Duda', 'Arthur', 'Edy'],
    ministers: ['Igor', 'Edy', 'Arthur', 'Ana', 'Daniela', 'Vanessa', 'Rayssa', 'Alessandro', 'Lucilene'],
    singers: ['Ana', 'Vanessa', 'Rayssa', 'Daniela', 'Lucilene']
};

const generateSchedule = () => {
    const schedule = [];
    const singerCounts = {
        'Ana': { count: 0, dates: [], lastWeek: -1 },
        'Vanessa': { count: 0, dates: [], lastWeek: -1 },
        'Rayssa': { count: 0, dates: [], lastWeek: -1 },
        'Daniela': { count: 0, dates: [], lastWeek: -1 },
        'Lucilene': { count: 0, dates: [], lastWeek: -1 }
    };

    const usedCombinations = []; // Armazena as combinações de vozes já usadas

    const getNextSunday = (date) => {
        let nextSunday = new Date(date);
        nextSunday.setDate(date.getDate() + (7 - date.getDay()));
        return nextSunday;
    };

    let currentSunday = getNextSunday(new Date());

    musicians.ministers.forEach((minister, weekIndex) => {
        let voices = musicians.singers.filter(singer => singer !== minister);
        
        // Sort voices by how long it's been since they last sang (and count)
        voices.sort((a, b) => {
            // Prioritize based on last participation, then on total count
            if (singerCounts[a].lastWeek !== singerCounts[b].lastWeek) {
                return singerCounts[a].lastWeek - singerCounts[b].lastWeek;
            }
            return singerCounts[a].count - singerCounts[b].count;
        });

        // Função para escolher uma combinação de vozes não repetida e com intervalo de semanas
        const findUniqueVoices = (voices, minister) => {
            // Se o ministro é um dos cantores, ele precisa estar como uma das vozes
            if (musicians.singers.includes(minister)) {
                const voice1 = minister; // Ministro será Voz 1
                const voice2 = voices.find(v => v !== voice1 && !usedCombinations.includes([voice1, v].toString())); // Seleciona uma voz diferente para Voz 2
                return [voice1, voice2];
            } else {
                // Ministro não é um cantor, então encontra uma combinação única para as vozes
                for (let i = 0; i < voices.length; i++) {
                    for (let j = i + 1; j < voices.length; j++) {
                        const combination = [voices[i], voices[j]];
                        const reverseCombination = [voices[j], voices[i]];

                        // Verifica se a combinação ou a inversa já foi usada
                        if (!usedCombinations.some(used =>
                            (used[0] === combination[0] && used[1] === combination[1]) ||
                            (used[0] === reverseCombination[0] && used[1] === reverseCombination[1])
                        )) {
                            return combination; // Retorna uma combinação única
                        }
                    }
                }
                // Se não encontrar nenhuma combinação única, retorna a primeira disponível
                return [voices[0], voices[1]];
            }
        };

        const [voice1, voice2] = findUniqueVoices(voices, minister);

        // Salvar a combinação usada
        usedCombinations.push([voice1, voice2].toString());

        const formattedDate = currentSunday.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        schedule.push({
            date: formattedDate,
            minister: minister,
            musicians: {
                'Guitarra e Voz': 'Igor',
                'Violão': 'Alessandro',
                'Teclado': 'Duda',
                'Baixo': 'Edy',
                'Bateria': 'Arthur',
                'Voz 1': voice1,
                'Voz 2': voice2
            }
        });

        // Atualiza contagem e última semana de participação
        singerCounts[voice1].count++;
        singerCounts[voice1].lastWeek = weekIndex;
        singerCounts[voice1].dates.push(formattedDate);

        singerCounts[voice2].count++;
        singerCounts[voice2].lastWeek = weekIndex;
        singerCounts[voice2].dates.push(formattedDate);

        currentSunday = getNextSunday(currentSunday);
    });

    return { schedule, singerCounts };
};



const { schedule, singerCounts } = generateSchedule();

const generateHTML = (schedule, singerCounts) => {
    let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f9;
            }
            .container {
                width: 80%;
                margin: 20px auto;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                background-color: #fff;
                padding: 20px;
                border: 1px solid #ccc;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ccc;
                text-align: center;
                padding: 12px;
            }
            th {
                background-color: #28a745;
                color: white;
                text-transform: uppercase;
            }
            .minister {
                font-weight: bold;
                color: blue;
                background-color: #e0f7fa;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .title {
                text-align: center;
                font-size: 24px;
                margin: 20px 0;
                color: #333;
            }
            .summary h2 {
                text-align: center;
                color: #333;
            }
            .summary table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .summary th, .summary td {
                border: 1px solid #ccc;
                padding: 10px;
                text-align: center;
            }
            .summary th {
                background-color: #28a745;
                color: white;
            }
        </style>
        <title>Escala - Grupo de adoração - Ministério Filadélfia</title>
    </head>
    <body>
        <div class="container">
            <div class="title">Escala - Grupo de adoração - Ministério Filadélfia</div>
            <table>
                <thead>
                    <tr>
                        <th colspan="6">Escala de Música</th>
                    </tr>
                    <tr>
                        <th>Data</th>`;
    schedule.forEach(day => {
        html += `<th>${day.date}</th>`;
    });
    html += `
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ministro</td>`;
    schedule.forEach(day => {
        html += `<td class="minister">${day.minister}</td>`;
    });
    html += `
                    </tr>
                    <tr>
                        <td>Violão</td>`;
    schedule.forEach(day => {
        html += `<td>${day.musicians['Violão']}</td>`;
    });
    html += `
                    </tr>
                    <tr>
                        <td>Baixo</td>`;
    schedule.forEach(day => {
    html += `<td>${day.musicians['Baixo']}</td>`;
    });
    html += `
                    </tr>
                    <tr>
                        <td>Bateria</td>`;
    schedule.forEach(day => {
        html += `<td>${day.musicians['Bateria']}</td>`;
    });
    html += `
                    </tr>
                    <tr>
                        <td>Voz 1</td>`;
    schedule.forEach(day => {
        html += `<td>${day.musicians['Voz 1']}</td>`;
    });
    html += `
                    </tr>
                    <tr>
                        <td>Voz 2</td>`;
    schedule.forEach(day => {
        html += `<td>${day.musicians['Voz 2']}</td>`;
    });
    html += `
                    </tr>
                </tbody>
            </table>
            <div class="summary">
                <h2>Resumo das Participações (Vozes)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Cantora</th>
                            <th>Quantidade de Participações</th>
                            <th>Datas</th>
                        </tr>
                    </thead>
                    <tbody>`;
    Object.keys(singerCounts).forEach(singer => {
        html += `
                        <tr>
                            <td>${singer}</td>
                            <td>${singerCounts[singer].count}</td>
                            <td>${singerCounts[singer].dates.join(', ')}</td>
                        </tr>`;
    });
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    </body>
    </html>`;
    return html;
};

const saveHTMLToFile = (htmlContent, filePath) => {
    fs.writeFileSync(filePath, htmlContent, 'utf8');
    console.log(`HTML saved to ${filePath}`);
};

const htmlContent = generateHTML(schedule, singerCounts);
saveHTMLToFile(htmlContent, `${__dirname}/escala.html`);