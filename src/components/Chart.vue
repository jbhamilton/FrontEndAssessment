<script>
import {Line} from 'vue-chartjs'

export default {
    extends : Line,
    props : {
        chartdata : Object,
    },
    data () {
        return {
            options : {
                scales : {
                    xAxes : [{
                        type : 'time',
                        time : {
                            unit : 'month',
                        },
                        distribution : 'series',
                        ticks : {
                            source : 'data',
                            autoSkip : true,
                            autoSkipPadding : 25, //value derived from testing page layout given static time range
                        }
                    }],
                    yAxes : [{
                        type : 'linear',
                        gridLines : {
                            drawBorder : false
                        },
                        scaleLabel : {
                            fontSize : '20',
                            fontStyle : 'bold',
                            display : true,
                            labelString : 'Closing Price ($)'
                        }
                    }]
                }
            }
        }
    },
    mounted() {
        console.log(this.chartdata);
        console.log(this.options);
        this.renderChart(this.chartdata, this.options);
    }
}
</script>
