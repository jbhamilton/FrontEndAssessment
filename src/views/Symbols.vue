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
              <div class="columns is-vcentered">
                  <div class="column is-narrow">
                      <div class="field has-addons">
                          <div class="control">
                              <div class="button is-static">Filter select</div>
                          </div>
                          <div class="select control">
                              <select v-model="displayGroup">
                                  <option
                                      v-for="f in filters"
                                      :key="f"
                                      :value="f"
                                  >
                                      {{f}}
                                  </option>
                              </select>
                          </div>
                      </div>
                  </div>
                  <div class="column is-narrow">
                      <div class="field has-addons">
                          <div class="control">
                              <div class="button is-static">Search</div>
                          </div>
                          <div class="control">
                              <input
                                  class="input"
                                  v-model="textSearch"
                                  placeholder="Search Term"
                              >
                          </div>
                      </div>
                  </div>
                  <div class="column">
                      <button class="button m-r-sm" @click="searchIn = 'Symbol'"> By Symbol </button>
                      <button class="button m-r-sm" @click="searchIn = 'Company'"> By Company </button>
                      <button class="button" @click="searchIn = '', textSearch = ''"> Reset </button>
                  </div>
              </div>
              <!-- Table start and headers -->
              <table class="table is-striped stock-table">
                  <thead>
                      <tr>
                          <th
                              v-for="h in headers"
                              :key="h.key"
                              :class="{ 'sortable-header' : h.sortable }"
                              @click="setSortHeader(h)"
                          >
                              {{h.name}}
                              <span v-if="h.sortable && sortOnHeader.key === h.key" class="icon">
                                  <i class="fa" :class="sortOnHeader.descending ? 'fa-angle-down' : 'fa-angle-up'"></i>
                              </span>
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                        <tr v-for="company in companiesSorted" :key="company.symbol">
                            <td class="stock-data symbol-name"> {{company.symbol}} </td>
                            <td class="stock-data company-name overflow-cell"> {{company.companyName}} </td>
                            <td class="stock-data status"> {{company.latestSource}} </td>
                            <td class="stock-data money"> <money :value="company.latestPrice"></money> </td>
                            <td class="stock-data numeric">
                                <number
                                    :value="company.dailyChange"
                                    :decimals="4"
                                    :class="textColor(company.dailyChange)"
                                />
                            </td>
                            <td class="stock-data money"> <money :value="company.open"></money> </td>
                            <td class="stock-data money"> <money :value="company.close"></money> </td>
                            <td class="stock-data time"> <timestamp :value="company.openTime"></timestamp> - <timestamp :value="company.closeTime"></timestamp> </td>
                            <td class="stock-data peRatio" :class="textColor(company.peRatio)">{{company.peRatio}}</td>
                            <td class="stock-data buttons-cell field is-grouped">
                                <button class="button is-danger is-light" v-if="!isHidden(company)"
                                        @click="hide(company)" :key="company.symbol">
                                    Hide
                                </button>
                                <button class="button is-dark" v-else
                                        @click="reinit(company)">
                                    Show
                                </button>
                                <button class="button is-success is-light" v-if="!isFavorite(company)"
                                        @click="fave(company)" style="margin-left: 5px; margin-right: 5px">
                                    Favorite
                                </button>
                                <button class="button is-dark" v-else
                                        @click="reinit(company)" style="margin-left: 5px; margin-right: 5px">
                                    Unfavorite
                                </button>
                                <button class="button is-info"
                                        @click="$router.push({name: 'detailed', query: {symbol: company.symbol} })">
                                    Details
                                </button>
                            </td>
                        </tr>
                  </tbody>
              </table>
          </div>
      </div>

    </div>
</template>

<script>
import API from '../api/IEX';
import _ from "underscore";

const FILTERS = {
    DEFAULT : 'Default',
    FAVORITE : 'Favorite',
    HIDDEN : 'Hidden',
}

export default {
    name : "Symbols",
    data () {
        return {
            loading : true,
            companies : [],
            displayGroup : FILTERS.DEFAULT,
            textSearch : '',
            searchIn : '',
            headers : [
                {
                    name : 'Symbol',
                    key : 'symbol',
                    sortable : true,
                    descending : false,
                },
                {
                    name : 'Company Name',
                    key : 'companyName',
                    sortable : true,
                    descending : false,
                },
                {
                    name : 'Status',
                    key : 'latestSource',
                    sortable : true,
                    descending : false,
                },
                {
                    name : 'Latest Price',
                    key : 'latestPrice',
                    sortable : true,
                    descending : true,
                },
                {
                    name : 'Daily Change',
                    key : 'dailyChange',
                    sortable : true,
                    descending : true,
                },
                {
                    name : 'Open',
                    key : 'open',
                    sortable : true,
                    descending : true,
                },
                {
                    name : 'Close',
                    key : 'close',
                    sortable : true,
                    descending : true,
                },
                {
                    name : 'Open From',
                    key : 'openFrom',
                },
                {
                    name : 'P/E Ratio',
                    key : 'peRatio',
                    sortable : true,
                    descending : true,
                },
                {
                    name : 'Actions',
                    key : 'actions',
                },
            ],
            sortOnHeader : null,
        };
    },
    beforeMount () {

        this.sortOnHeader = this.headers.find(h => h.key === 'dailyChange');

        let filterCache = {};
        if(localStorage.getItem('symbols')) {
            filterCache = JSON.parse( localStorage.getItem('symbols') );
        }

        API.getCompanies().then(response => {
            this.companies = response.data.filter(c => c.open && c.close).map(company => {

                if (!(company.open && company.close)) {
                    return;
                }

                company.filterStatus = filterCache[company.symbol];

                if (company.openTime > company.closeTime) {
                    company.dailyChange = ((company.open - company.close) / company.close * 100);
                } else {
                    company.dailyChange = ((company.close - company.open) / company.open * 100);
                }

                return company;

            });
        }).finally(() => {
            this.loading = false;
        });

    },
    methods : {
        writeFilterCache () {
            const filterStatus = {};
            this.companies.filter(c => c.filterStatus).forEach(c => filterStatus[c.symbol] = c.filterStatus);
            localStorage.setItem('symbols', JSON.stringify(filterStatus));
        },
        fave (company) {
            company.filterStatus = FILTERS.FAVORITE;
            this.writeFilterCache();
        },
        hide (company) {
            company.filterStatus = FILTERS.HIDDEN;
            this.writeFilterCache();
        },
        reinit (company) {
            company.filterStatus = null;
            this.writeFilterCache();
        },
        isHidden (company) {
            return company.filterStatus === FILTERS.HIDDEN;
        },
        isFavorite (company) {
            return company.filterStatus === FILTERS.FAVORITE;
        },
        textColor (value) {
            return value > 0 ? 'has-text-success' : 'has-text-danger';
        },
        setSortHeader (header) {
            if(!header.sortable) {
                return;
            }
            if(header.key === this.sortOnHeader.key) {
                header.descending = !header.descending;
            }
            this.sortOnHeader = header;
        },
    },
    computed : {
        filters () {
            return Object.values(FILTERS);
        },
        companiesSorted : function () {
            const testString = new RegExp(this.textSearch, 'i');
            const searchKey = this.searchIn === 'Symbol' ? 'symbol' : 'companyName';

            let companies = this.companies;

            if(this.displayGroup !== FILTERS.DEFAULT) {
                companies = companies.filter(c => c.filterStatus === this.displayGroup);
            } else {
                companies = companies.filter(c => c.filterStatus !== FILTERS.HIDDEN);
            }

            if (this.textSearch) {
                companies = companies.filter(c => testString.test(c[searchKey]));
            }

            companies = _.sortBy(companies, this.sortOnHeader.key);

            return this.sortOnHeader.descending ? companies.reverse() : companies;

        }
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
