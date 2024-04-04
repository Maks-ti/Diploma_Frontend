
var tabCharts = new Map();
var tabNodes = new Map();
var tabEdges = new Map();


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
    main.style.width = '700px';
    main.style.height = '700px';
    main.style.border = '1px solid #000';
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
    switch(command.CommandName){
        case 'Create':
            nodes.push(
            {
                id: `${command.NodeId}`,
                name: command.Value.Name,
                fixed: false,
                symbolSize: command.Value.Name ? command.Value.Name : 20,
                itemStyle: { color: command.Value.Color ? command.Value.Color : '#f00' },
                label: { show: true }
            }
            );
            break;
        case 'SetName':

            break;
        case 'SetColor':

            break;
        case 'SetSize':

            break;
        case 'SetSelected':

            break;
        case 'SetVisited':

            break;
        case 'SetValue':

            break;
        case 'AddChild':
            edges.push(
            {
                source:
                target:
                
            }
            );
            break;
        case 'DeleteChild':

            break;
        case 'Delete':

            break;
        default:

            break;
    } // swithc - end

    console.log(nodes);

    chart.setOption(
        {
        series: [
              {
                type: 'graph',
                layout: 'force',
                force: {
                    repulsion: 200, // Сила отталкивания между узлами
                    edgeLength: 50, // Длина рёбер
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

    return;
}