<template>
  <div v-if="this.$route.query.symbol">
      <loading v-if="loading"></loading>
      <div v-else>
          <div class="primary-heading-con">
              <div class="heading">
                  <div class="title"> Detailed View of {{this.$route.query.symbol}}</div>
              </div>
          </div>
          <!-- Container to align a minimal table element with the larger chart -->
          <div style="width: 100%; height: 100%; display: flex">
          <!-- Headerless two-row "table" used for basic data organization -->
          <table class="table is-narrow page-content-con" style="font-size: large; max-width: 300px">
              <tr><td><figure class="media-content"><p class="image"> <img style="width: auto; height: auto; max-height: 128px; max-width: 128px" v-bind:src="this.logo"> </p></figure></td>
              <td>{{quote.companyName}}</td></tr>
              <tr><td>Opening Price: <td>${{quote.open}}</td></tr>
              <tr><td>Closing Price: <td>${{quote.close}}</td></tr>
              <tr><td>Daily Change: <td v-bind:style="changeStyle">
                  {{dailyChangePercent>0?'+':''}}{{ dailyChangePercent.toLocaleString('en-us', {maximumFractionDigits : 3}) }}%</td></tr>
              <tr><td>Primary Exchange: <td>{{quote.primaryExchange}}</td></tr>
              <tr><td>Status: <td>{{quote.latestSource=='Close'? 'Closed' : 'Trading'}}</td></tr>
              <tr><td>Latest Price: <td>${{quote.latestPrice}}</td></tr>
              <tr><td>YTD Change: <td v-bind:style="ytdStyle">{{YTD>0?'+':''}}{{YTD}}%</td></tr>
              <tr><td>52-Week High: <td>${{quote.week52High}}</td></tr>
              <tr><td>52-Week Low: <td>${{quote.week52Low}}</td></tr>
              <tr><td>P/E Ratio: <td>{{quote.peRatio}}</td></tr>
          </table>
          <!-- Chart container -->
          <div id="app">
              <div class="container" style="width: 900px; padding-left: 20px">
                  <div class="Chart__list">
                      <div class="Chart">
                          <Chart :chartdata="chartdata"></Chart>
                      </div>
                  </div>
              </div>
          </div>
          </div>
      </div>
  </div>
<!-- Fallback page in case one manually visits '/detailed' - used for learning purposes -->
  <div v-else>
      <div class="primary-heading-con">
          <div class="heading">
              <div class="title">Turn back! This page wants a <span style="font-weight: bold; background-color: yellow">VALID</span> symbol parameter</div>
          </div>
      </div>

      <div class="page-content-con has-text-centered m-lg">
          <h1 class="heading is-size-4">Do you know the symbol name you want to search?</h1>
          <p class="is-size-4">Are you sure? It's your API token!</p>
          <p>Then enter the symbol below and press enter</p>
          <div style=" alignment: center">
              <input style="max-width: 200px" v-model="inputSymbol" class="input is-danger" type="text" placeholder=""
                     v-on:keyup.enter="$router.push({name: 'detailed', query: {symbol: inputSymbol} })">
          </div>
      </div>

  </div>
</template>

<script>
import API from '../api/IEX';
import Chart from '@/components/Chart.vue';
export default {
    name : 'Detailed',
    data () {
        return {
            inputSymbol : '',
            loading : true,
            quote : [],
            chart : [],
            stats : [],
            logo : '',
            chartdata : {},
        };
    },
    components : {
        Chart
    },
    computed : {
        YTD : function () {
            let num = this.quote.ytdChange*100;
            return num.toLocaleString('en-us', {maximumFractionDigits : 2});
        },
        dailyChangePercent : function () {
            return 100*( (this.quote.openTime>this.quote.closeTime) ? ((this.quote.open-this.quote.close)/this.quote.close):((this.quote.close-this.quote.open)/this.quote.open));
        },
        changeStyle : function ()
        {
            if ((this.dailyChangePercent) > 0)
                return {color : 'darkgreen'};
            else
                return {color : 'lightcoral', fontWeight : 'bold'}
        },
        ytdStyle : function () {
            if ((this.YTD) > 0)
                return {color : 'darkgreen'};
            else
                return {color : 'lightcoral', fontWeight : 'bold'}
        }
    },
    beforeMount () {
        if (this.$route.query.symbol)
            API.getSingle(this.$route.query.symbol).then(response => {
                this.quote = response.data.quote;
                if (!this.quote.open)
                    this.quote.open = this.quote.previousClose;
                if (!this.quote.close)
                    this.quote.close = this.quote.latestPrice;
                this.chart = response.data.chart;
                this.stats = response.data.stats;
                this.logo = response.data.logo.url;
                var data = [];
                for (var i = 0; i<this.chart.length; i++)
                {
                    data[i] = {
                        x : this.chart[i].date,
                        y : this.chart[i].close
                    }
                }
                console.log(data);
                console.log(this.chartoptions);
                this.chartdata = {datasets : [{
                    data : data,
                    type : 'line',
                    pointRadius : 2,
                    borderColor : '#df2020',
                    lineTension : .2,
                    borderWidth : 2,
                    label : this.$route.query.symbol + ' 2-Year Historical Data'
                }]};
                console.log(this.chartdata);
            }).finally(() => {
                this.loading = false;
                console.log(this.quote);
                console.log(this.chart);
                console.log(this.stats);
                console.log(this.logo);
            });
    },
}
</script>
