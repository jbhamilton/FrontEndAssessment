<template>
    <div>
      <div class="primary-heading-con">
          <div class="heading">
              <div class="title">Symbols/Tickers</div>
          </div>
      </div>

      <div class="page-content-con">
          <loading v-if="loading"></loading>
          <div v-else>
              <!-- User input area sitting above the main table -->
              <header>Filter select:&nbsp;
                  <select v-model="displayGroup">
                      <option value = 'Default'>Default</option>
                      <option value = 'Favorites'>Favorites</option>
                      <option value = 'Hidden'>Hidden</option>
                  </select>
                  <span>&emsp;Search:&nbsp;
                      <input v-model="textSearch" placeholder="Search Term">
                      <button @click="searchIn = 'Symbol'"> By Symbol </button>
                      <button @click="searchIn = 'Company'"> By Company </button>
                      <button @click="searchIn = '', textSearch = ''"> Reset </button>
                  </span>
               </header>
              <!-- Table start and headers -->
              <table class="table is-striped stock-table">
              <thead>
              <tr>
                  <th class="sortable-header"
                  @click="sortBy = sortBy=='SymbolAsc' ? 'SymbolDsc' : 'SymbolAsc'"
                  >
                      Symbol {{sortBy=='SymbolDsc' ? '&dArr;' : sortBy=='SymbolAsc' ? '&uArr;' : ''}}
                  </th>
                  <th class="sortable-header"
                  @click="sortBy = sortBy=='CompanyAsc' ? 'CompanyDsc' : 'CompanyAsc'">
                      Company Name {{sortBy=='CompanyDsc' ? '&dArr;' : sortBy=='CompanyAsc' ? '&uArr;' : ''}}
                  </th>
                  <th>Status</th>
                  <th class="sortable-header"
                      @click="sortBy = sortBy=='LatestPriceAsc' ? 'LatestPriceDsc' : 'LatestPriceAsc'">
                      Latest Price {{sortBy=='LatestPriceDsc' ? '&dArr;' : sortBy=='LatestPriceAsc' ? '&uArr;' : ''}}
                  </th>
                  <th v-for="colName in ['Daily Change', 'Open', 'Close', 'Open From']" :key="colName">{{colName}}</th>
                  <th class="sortable-header"
                      @click="sortBy = sortBy=='peAsc' ? 'peDsc' : 'peAsc'">
                      P/E Ratio {{sortBy=='peDsc' ? '&dArr;' : sortBy=='peAsc' ? '&uArr;' : ''}}
                  </th>
                  <th>Actions</th>
              </tr>
              </thead>
              <!-- Table body - the chunky v-if statement is simply managing filtering by tags -->
              <tbody>
                <template v-for="company in companiesSorted">
                    <tr :key="company.symbol"
                    v-if="((displayGroup==='Default'&&symbolGroups[company.symbol]!=='Hidden') ||
                    (displayGroup==='Favorites'&&symbolGroups[company.symbol]==='Favorites') ||
                    (displayGroup==='Hidden'&&symbolGroups[company.symbol]==='Hidden'))"
                    >
                        <td class="stock-data symbol-name"> {{company.symbol}} </td>
                        <td class="stock-data company-name overflow-cell"> {{company.companyName}} </td>
                        <td class="stock-data status"> {{company.latestSource=='Close'?'Closed':'Trading'}} </td>
                        <td class="stock-data money"> <money :value="company.latestPrice"></money> </td>
                        <td class="stock-data numeric">
                            {{DailyChange(company.open, company.close, company.openTime, company.closeTime)}}
                        </td>
                        <td class="stock-data money"> <money :value="company.open"></money> </td>
                        <td class="stock-data money"> <money :value="company.close"></money> </td>
                        <td class="stock-data time"> <timestamp :value="company.openTime"></timestamp> - <timestamp :value="company.closeTime"></timestamp> </td>
                        <td class="stock-data peRatio" v-bind:class="{ bgWarn : company.peRatio<0 }">{{company.peRatio}}</td>
                        <td class="stock-data buttons-cell field is-grouped">
                            <button class="button is-danger is-light" v-if="symbolGroups[company.symbol]!=='Hidden'"
                                    @click="Hide(company.symbol)" :key="company.symbol">
                                Hide
                            </button>
                            <button class="button is-dark" v-else
                                    @click="Reinit(company.symbol)">
                                Show
                            </button>
                            <button class="button is-success is-light" v-if="symbolGroups[company.symbol]!=='Favorites'"
                                    @click="Fave(company.symbol)" style="margin-left: 5px; margin-right: 5px">
                                Favorite
                            </button>
                            <button class="button is-dark" v-else
                                    @click="Reinit(company.symbol)" style="margin-left: 5px; margin-right: 5px">
                                Unfavorite
                            </button>
                            <button class="button is-info"
                                    @click="$router.push({name: 'detailed', query: {symbol: company.symbol} })">
                                Details
                            </button>
                        </td>
                    </tr>
                </template>
              </tbody>
              </table>
          </div>
      </div>

    </div>
</template>

<script>
import API from '../api/IEX';
import * as _ from "underscore";
export default {
    name : "Symbols",
    data () {
        return {
            loading : true,
            companies : [],
            symbolGroups : [],
            displayGroup : 'Default',
            sortBy : 'SymbolAsc',
            textSearch : '',
            searchIn : ''
        };
    },
    methods :
        {
            Fave : function (symbol)
            {
                this.symbolGroups[symbol] = 'Favorites';
                localStorage.setItem(symbol, 'Favorites');
            },
            Hide : function(symbol)
            {
                this.symbolGroups[symbol] = 'Hidden';
                localStorage.setItem(symbol, 'Hidden');
            },
            Reinit : function (symbol)
            {
                this.symbolGroups[symbol] = 'default';
                localStorage.setItem(symbol, 'default');
            },
            /**
             * @return {string}
             */
            DailyChange : function (open, close, openTime, closeTime)
            {
                var retval;
                if (openTime>closeTime)
                    retval = ((open-close)/close*100);
                else
                    retval = ((close-open)/open*100);
                if (retval == 0)
                    return '0';
                else if (retval > 0)
                {
                    return '+' + retval.toLocaleString() + "%";
                }
                else // retval < 0
                {
                    return  retval.toLocaleString() + "%";
                }
            }
        },
    computed :
        {
            companiesSorted : function () {
                var companies = [];
                var index = 0;
                var elem = 0;
                let testString = this.textSearch.toLowerCase();
                if (this.searchIn != '')
                {
                    if (this.searchIn == 'Symbol')
                    {
                        for (elem in this.companies)
                        {
                            let mainString = this.companies[elem].symbol.toLowerCase();
                            if (mainString.includes(testString))
                            //if (this.companies[elem].symbol.includes(this.textSearch))
                                companies[index++] = this.companies[elem];
                        }
                    }
                    else if (this.searchIn == 'Company')
                    {
                        for (elem in this.companies)
                        {
                            let mainString = this.companies[elem].companyName.toLowerCase();
                            if (mainString.includes(testString))
                            //if (this.companies[elem].companyName.includes(this.textSearch))
                                companies[index++] = this.companies[elem];
                        }
                    }
                }
                else
                    companies = this.companies;
                switch (this.sortBy) {
                    case 'Default':
                        return companies;
                    case 'SymbolAsc' :
                        return _.sortBy(companies, 'symbol');
                    case 'SymbolDsc' :
                        return _.sortBy(companies, 'symbol').reverse();
                    case 'CompanyAsc' :
                        return _.sortBy(companies, 'companyName');
                    case 'CompanyDsc' :
                        return _.sortBy(companies, 'companyName').reverse();
                    case 'LatestPriceAsc' :
                        return _.sortBy(companies, 'latestPrice');
                    case 'LatestPriceDsc' :
                        return _.sortBy(companies, 'latestPrice').reverse();
                    case 'peAsc' :
                        return _.sortBy(companies, 'peRatio');
                    case 'peDsc' :
                        return _.sortBy(companies, 'peRatio').reverse();
                }
            }
        },
    beforeMount () {
        API.getCompanies().then(response => {
            let index = 0;
            for (var cmp in response.data)
            {
                let company = response.data[cmp];
                if (!(company.open&&company.close))
                    continue;
                this.companies[index] = company;
                if (localStorage.getItem(company.symbol))
                    //this.symbolgroups[company.symbol] = localStorage.getItem(company.symbol);
                    this.$set(this.symbolGroups, company.symbol, localStorage.getItem(company.symbol));
                else
                {
                    //this.symbolgroups[company.symbol] = 'default';
                    this.$set(this.symbolGroups, company.symbol, 'default');
                    localStorage.setItem(company.symbol, 'default');
                }
                index++;
            }
        }).finally(() => {
            this.loading = false;
        });
    },
    updated () {
        this.$nextTick( function() {
            let set = document.getElementsByClassName('numeric');
            for (var elem = 0; elem < set.length; elem++) {
                if (set[elem].childNodes[0].data.includes('+'))
                    set[elem].style.color = "#2c904f";
                else
                    set[elem].style.color = "#c62424";
            }
        })
    },
}
</script>


<style lang="scss" scoped>
    @import '../assets/css/_theme';
    .company {
        margin-bottom:10px;
        padding-bottom:10px;
        border-bottom:1px solid $white-ter;
    }
</style>
