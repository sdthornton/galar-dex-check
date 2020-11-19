import Vue from 'vue';
import VueMaterial from 'vue-material';
import VueGapi from 'vue-gapi';
import DexBox from './DexBox';
import * as CONFIG from './config';

const apiConfig = {
  apiKey: CONFIG.API_KEY,
  clientId: CONFIG.CLIENT_ID,
  clientSecret: CONFIG.CLIENT_SECRET,
  discoveryDocs: CONFIG.DISCOVERY_DOCS,
  scope: CONFIG.SCOPE,
};

Vue.use(VueMaterial);
Vue.use(VueGapi, apiConfig);

const app = new Vue({
  el: "#app",
  components: {
    DexBox,
  },
  data() {
    return {
      galarDexData: [],
      isleDexData: [],
      tundraDexData: [],
      homeData: [],
      loadingGapi: true,
      loadingData: true,
      showMissing: false,
    };
  },
  computed: {
    loading() {
      return this.loadingGapi || this.loadingData;
    },
    chunkedGalarData() {
      let filtered = this.galarDexData.filter(d => {
        return !d.gmax;
      });
      return this.chunk(filtered, 30);
    },
    chunkedIsleData() {
      let galarNatDexes = this.galarDexData.map(a => a.natDex);
      let filtered = this.isleDexData.filter(d => {
        return (
          !d.gmax &&
          !galarNatDexes.includes(d.natDex)
        )
      });
      return this.chunk(filtered, 30);
    },
    chunkedTundraData() {
      let galarNatDexes = [...new Set([...this.galarDexData.map(a => a.natDex), ...this.isleDexData.map(a => a.natDex)])];
      let filtered = this.tundraDexData.filter(d => {
        return (
          !d.gmax &&
          !galarNatDexes.includes(d.natDex)
        )
      });
      return this.chunk(filtered, 30);
    },
    chunkedGmaxData() {
      let galarFiltered = this.galarDexData.filter(d => d.gmax);
      let galarNatDexes = galarFiltered.map(a => a.natDex)
      let isleFiltered = this.isleDexData.filter(d => d.gmax && !galarNatDexes.includes(d.natDex));
      return [galarFiltered, isleFiltered];
    },
    chunkedHomeData() {
      return this.chunk(this.homeData, 30);
    },
    missingMons() {
      // let filtered = this.dexData.filter(d => !d.inBox && d.obtainable);
      // return filtered;
      return [];
    },
  },
  created() {
    this.fetchGalarDexData();
    this.fetchIsleDexData();
    this.fetchTundraDexData();
    // this.fetchHomeData();
    this.$gapi.getGapiClient().then(() => this.loadingGapi = false);
    try {
      window.setInterval(this.$gapi.refreshToken(), 2.7e+6);
    } catch (err) {
      console.error(err);
    }
  },
  mounted() {
    document.addEventListener('keydown', e => {
      if (e.key == "Escape") {
        this.showMissing = false;
      }
    });
  },
  methods: {
    chunk(arr, size) {
      return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => {
        return arr.slice(i * size, i * size + size);
      });
    },
    createDexJson(d) {
      let spriteReg = /\=image\("/gi;
      return {
        "id": Number(d.values[0].formattedValue),
        "dexNumber": Number(d.values[1].formattedValue),
        "name": d.values[2].userEnteredValue.stringValue,
        "sprite": d.values[3].userEnteredValue.formulaValue.replace(spriteReg, '').replace('")', ''),
        "gender": d.values[4] && d.values[4].userEnteredValue ? d.values[4].userEnteredValue.stringValue : "",
        "form": d.values[5] && d.values[5].userEnteredValue ? d.values[5].userEnteredValue.stringValue : "",
        "gmax": d.values[6] && d.values[6].userEnteredValue ? true : false,
        "inBox": d.values[8].userEnteredValue.stringValue == "Yes" ? true : false,
        "natDex": d.values[9] ? Number(d.values[9].formattedValue) : null,
        "obtainable": d.values[10] && d.values[10].userEnteredValue ? false : true,
        "legendOrMyth": (d.values[11] || d.values[12]) && (d.values[11].userEnteredValue || d.values[12].userEnteredValue) ? true : false,
        "homeTransferOnly": d.values[13] && d.values[13].userEnteredValue == "Yes" ? true : false,
      };
    },
    fetchGalarDexData() {
      fetch(`${CONFIG.SPREADSHEET_URL}?key=${CONFIG.API_KEY}&includeGridData=true&ranges='Galar'!A2:N607&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async res => this.galarDexData = await this.prepDexResponse(res))
      .finally(() => this.loadingData = false);
    },
    fetchIsleDexData() {
      fetch(`${CONFIG.SPREADSHEET_URL}?key=${CONFIG.API_KEY}&includeGridData=true&ranges='Isle'!A2:N275&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async res => this.isleDexData = await this.prepDexResponse(res));
    },
    fetchTundraDexData() {
      fetch(`${CONFIG.SPREADSHEET_URL}?key=${CONFIG.API_KEY}&includeGridData=true&ranges='Tundra'!A2:N255&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async res => this.tundraDexData = await this.prepDexResponse(res));
    },
    fetchHomeData() {
      fetch(`${CONFIG.SPREADSHEET_URL}?key=${CONFIG.API_KEY}&includeGridData=true&ranges='Home'!A2:N37&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async res => this.homeData = await this.prepDexResponse(res));
    },
    async prepDexResponse(res) {
      let data = await res.json();
      let dexData =
        data.sheets[0].data[0].rowData
          .filter(d => d.values && d.values[0] && d.values[0].userEnteredValue)
          .filter(d => !(d.values[7] && d.values[7].userEnteredValue))
          .map(d => this.createDexJson(d));
      return dexData;
    },
  },
});
