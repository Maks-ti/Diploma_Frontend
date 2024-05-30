
var tabCharts = new Map(); // str: object
var tabNodes = new Map(); // str: []
var tabEdges = new Map(); // str: []


function handleMessage(message) {
    const { command, manager_id } = message;
    // Проверяем, существует ли уже вкладка с таким manager_id
    if (!document.querySelector(`a[href="#${manager_id}"]`)) {
        createTab(manager_id);
    }
    // Добавляем или обновляем контент для вкладки
    updateTabContent(manager_id, command);
}

function createTab(managerId) {
    // создаём вкладку
    const tab = document.createElement('li');
    tab.className = 'nav-item';
    const tabLink = document.createElement('a');
    tabLink.className = 'nav-link';
    tabLink.id = `${managerId}-tab`;
    tabLink.dataset.toggle = 'tab';
    tabLink.href = `#${managerId}`;
    tabLink.role = 'tab';
    tabLink.textContent = `Вкладка ${managerId}`;
    tab.appendChild(tabLink);

    const content = document.createElement('div');
    content.className = 'tab-pane fade';
    content.id = managerId;
    content.role = 'tabpanel';
    content.setAttribute('aria-labelledby', `${managerId}-tab`);
    // добавляем элемент для основы графа
    let main = document.createElement('div');
    main.id = `${managerId}-main`;
    main.style.width = 'calc(100vw - 24px)';
    main.style.height = 'calc(100vh - 240px)';
    main.style.border = '1px solid #4ae0d4';
    main.style.borderRadius = '8px';
    content.appendChild(main);

    document.getElementById('myTab').appendChild(tab);
    document.getElementById('myTabContent').appendChild(content);

    // Активация первой вкладки и её содержимого, если это первая вкладка
    if(document.getElementById('myTab').getElementsByClassName('nav-item').length === 1) {
        tabLink.className += ' active';
        content.className += ' show active';
    }
    
    // добавляем ключи в словари
    tabCharts.set(managerId, echarts.init(document.getElementById(`${managerId}-main`)));
    console.log('tabCharts:');
    console.log(tabCharts);
    tabNodes.set(managerId, []);
    tabEdges.set(managerId, []);
}

function updateTabContent(managerId, command) {
    const contentPane = document.getElementById(managerId);
    if (!contentPane) {
        console.error(`Pane for managerId ${managerId} not found.`);
        return;
    }

    // Добавляем новый контент, вместо перезаписи всего существующего
    updateGraph(managerId, command);
    /*
    const newContent = document.createElement('p');
    newContent.innerHTML = `Команда: ${command.CommandName}, Значение: ${command.Value}`;
    contentPane.appendChild(newContent);
    */
}

// добавляем событие переключения между вкладками
document.addEventListener('DOMContentLoaded', function () {
    // Перехватываем клик по всем вкладкам
    $('#myTab').on('click', 'a[data-toggle="tab"]', function (e) {
        e.preventDefault();

        // Удаляем класс 'active' у всех вкладок и панелей
        $('.nav-link, .tab-pane').removeClass('active');
        $('.tab-pane').removeClass('show');

        // Добавляем класс 'active' к выбранной вкладке
        $(this).addClass('active');
        // И получаем ID целевой панели контента
        const activeTabId = $(this).attr('href');

        // Добавляем класс 'active' и 'show' к соответствующей панели контента
        $(activeTabId).addClass('active show');
    });
});

function updateGraph(managerId, command){
    // получаем данные текущего графа
    let chart = tabCharts.get(managerId);
    let nodes = tabNodes.get(managerId);
    let edges = tabEdges.get(managerId);

    // обрабатываем пришедшую команду
    let index = -1;
    switch(command.CommandName){
        case 'Create':
            nodes.push(
            {
                id: `${command.ObjId}`,
                name: command.Value.Name,
                fixed: false,
                symbol: 'circle',
                symbolSize: command.Value.Size ? command.Value.Size : 20,
                itemStyle: { 
                    color: command.Value.Color ? command.Value.Color : '#f00'  // ,
                    // borderColor: invertColor(command.Value.Color ? command.Value.Color : '#f00'), // Инвертированный цвет
                    // borderWidth: command.Value.Visited * 3 // Ширина равна значению Visited
                },
                label: { 
                    show: true,
                    formatter: (params) => {
                        return `${params.data.name}\nselected: ${params.data.selected}\nvisited: ${params.data.visited}\nvalue: ${params.data.node_value}`;
                    },
                    color: '#000', // Чёрный цвет текста
                    fontSize: 18 // Устанавливает размер текста
                 },
                // my parametres
                selected: command.Value.Selected,
                visited: command.Value.Visited,
                node_value: command.Value.Value
            }
            );
            break;
        case 'SetName':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].name = command.Value;
            } 
            break;
        case 'SetColor':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].itemStyle = { color: command.Value ? command.Value : '#f00' }
            } 
            break;
        case 'SetSize':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].symbolSize = (command.Value ? command.Value : 20)
            }
            break;
        case 'SetSelected':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].selected = command.Value;
            }
            break;
        case 'SetVisited':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].visited = command.Value;
            }
            break;
        case 'SetValue':
            index = nodes.findIndex(node => node.id === command.ObjId);
            if (index !== -1){
                // update node
                nodes[index].node_value = command.Value;
            }
            break;
        case 'AddChild':
            edges.push(
            {
                id: command.Value.Id,
                source: command.Value.NodeFromId,
                target: command.Value.NodeToId,
                parametres: command.Value.Parameters,
                label: {
                    show: true,
                    formatter: (params) => {
                        let obj = params.data.parametres;
                        let str = Object.keys(obj).map(key => `${key}: ${obj[key]}`).join('\n');
                        return str;
                    },
                    position: 'middle',
                    color: '#000', // Чёрный цвет текста
                    align: 'center',
                    verticalAlign: 'middle',
                    rotate: 0, // Поворот текста на 90 градусов для вертикального отображения
                    fontSize: 18 // Устанавливает размер текста
                },
                lineStyle: {
                    normal: {
                        curveness: 0.1, // Небольшая кривизна ребра для лучшей визуализации направления
                        width: 5,
                        color: '#000'
                    }
                },
                symbol: ['none', 'arrow'], // Устанавливаем символы для начала и конца линии ('none' - нет символа, 'arrow' - стрелка)
                symbolSize: [0, 20] // Размер символов для начала и конца линии (0 - нет символа, 10 - размер стрелки)
            }
            );
            break;
        case 'DeleteChild':
            edges = edges.filter(edge => !(edge.id === command.Value)); // удаляем ребро с указанным Id
            break;
        case 'Delete':
            nodes = nodes.filter(node => !(node.id === command.Value)); // удаляем узел с указанным Id
            break;
        case 'SetEdgeParametres':
            index = edges.findIndex(edge => edge.id === command.ObjId);
            if (index !== -1){
                // update edge
                edges[index].parametres = command.Value;
            }
            break;
        default:
            break;
    } // swithc - end

    console.log(nodes);
    console.log(edges);

    chart.setOption(
        {
        series: [
              {
                type: 'graph',
                layout: 'force',
                force: {
                    repulsion: 250, // Сила отталкивания между узлами
                    edgeLength: 60, // Длина рёбер
                    // Другие параметры силы...
                },
                symbol: 'circle',
                roam: true,
                data: nodes,
                edges: edges
              }
            ]
        }
    );

    console.log(chart);

    return;
}

function invertColor(hex) {
    // Удаляем символ '#' для упрощения обработки
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }
    
    // Переводим каждый символ в числовое представление, инвертируем и переводим обратно в шестнадцатеричный формат
    let r = (15 - parseInt(hex[0], 16)).toString(16);
    let g = (15 - parseInt(hex[1], 16)).toString(16);
    let b = (15 - parseInt(hex[2], 16)).toString(16);

    // Возвращаем результат в форме трёхзначного шестнадцатеричного цвета с символом '#'
    return '#' + r + g + b;
}
