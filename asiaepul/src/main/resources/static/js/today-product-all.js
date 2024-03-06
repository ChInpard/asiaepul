document.addEventListener("DOMContentLoaded", async () => {
    const dom = document.getElementById('product-all-chart');
    const myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: 260
    });
 
    
    async function drawChart() {
		// FastAPI 판매량 증감 추이 url
		const url = 'http://localhost:8000/product-all';
		
		const response = await fetch(url);
		const chartData = await response.json();
		console.log(chartData);

	
	    const option = {
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {
	                type: 'cross',
	                crossStyle: {
	                    color: '#999'
	                }
	            }
	        },
	        toolbox: {
	            feature: {
	                dataView: { show: true, readOnly: true },
	                magicType: { show: true, type: ['line', 'bar'] },
	                restore: { show: true },
	                saveAsImage: { show: true }
	            }
	        },
	        xAxis: [
	            {
	                type: 'category',
	                name: '',
	                data: chartData.categories,
	                axisPointer: {
	                    type: 'shadow'
	                }
	            }
	        ],
	        yAxis: [
	            {
	                type: 'value',
	                name: '판매량',
	            	nameGap: 25,
	                axisLabel: {
                    	margin: 10
                	}
	            }
	        ],
	        series: [
			    {
			        data: chartData.series,
			        type: 'bar'
			    }
		  	],
	        dataZoom: [
	            {
	              type: 'inside'
	            },
	            {
	              start: 0,
	              end: 0
	            }
	        ]
	    };
	 
	    myChart.setOption(option);
	    
	    const dataSize = chartData.length;
	    const startValue = 0;
	    const endValue = dataSize;
	
	    myChart.dispatchAction({
	        type: 'dataZoom',
	        startValue: startValue,
	        endValue: endValue
	    });
	    
	    window.addEventListener('resize', myChart.resize);
    }
    drawChart();
 
});