document.addEventListener('DOMContentLoaded', function() {
    const bestMartChartSection = document.getElementById('bestmart-chart');
    const bestMartChart = echarts.init(bestMartChartSection, null, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: 580
    });
    
    async function drawChart() {
        // FastAPI 마트 실적 순위 url
        const url = 'http://localhost:8000/mart-rank';
        
        const response = await fetch(url);
        const chartData = await response.json();
        
        // 전체 판매량 계산
        const totalSales = chartData.series.reduce((acc, currentValue) => acc + currentValue.value, 0);

        const option = {
            color: ['#2D68FE'],
            toolbox: {
                feature: {
                    saveAsImage: { show: true }
                }
            },
            xAxis: {
                type: 'value',
                name: '판매량',
                nameLocation: 'middle',
                nameGap: 40
            },
            yAxis: {
                type: 'category',
                data: chartData.categories,
                name: '지점',
                nameLocation: 'end',
                axisLabel: {
                    margin: 10
                }
            },
            series: [
                {
                    name: '판매량',
                    data: chartData.series,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'insideRight',
                        formatter: function(params) {
                            let percent = ((params.data.value / totalSales) * 100).toFixed(2); // 해당 막대가 전체의 몇 퍼센트를 차지하는지 계산
                            return params.data.value + 
                            	'               (' + percent + '%)'; // 해당 막대의 판매량과 비율을 표시
                        },
                        textStyle: {
                            color: '#ffffff'
                        }
                    }
                }
            ]
        };
    
        if (option && typeof option === 'object') {
            bestMartChart.setOption(option);
        }
    };
    
    drawChart();

    window.addEventListener('resize', bestMartChart.resize);
});
