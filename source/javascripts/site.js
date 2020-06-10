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
      dexData: [],
      loadingGapi: true,
      loadingData: true,
      showMissing: false,
    };
  },
  computed: {
    loading() {
      return this.loadingGapi || this.loadingData;
    },
    chunkedUnobtainable() {
      let filtered = this.dexData.filter(d => !d.obtainable);
      return this.chunk(filtered, 30);
    },
    chunkedDexData() {
      let filtered = this.dexData.filter(d => {
        return (
          !d.gmax &&
          d.dexNumber.indexOf("#") == 0 ||
          this.isMew(d) ||
          this.isGalarSlowpoke(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedHatchableHomeData() {
      let filtered = this.dexData.filter(d => {
        return (
          d.dexNumber == "-" &&
          !d.legendsAndMyths &&
          !d.gmax &&
          !this.isMew(d) &&
          !this.isGalarSlowpoke(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedLegendaryHomeData() {
      let filtered = this.dexData.filter(d => {
        return (
          d.dexNumber == "-" &&
          d.legendsAndMyths &&
          !d.gmax &&
          !this.isMew(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedGmaxData() {
      let filtered = this.dexData.filter(d => d.gmax && d.obtainable);
      return this.chunk(filtered, 30);
    },
    chunkedIsleData() {
      let filteredNormal = this.dexData.filter(d => (d.isleOfArmor && !d.gmax));
      let filteredGmax = this.dexData.filter(d => (d.isleOfArmor && d.gmax));
      return this.chunk([...filteredNormal, ...filteredGmax], 30);
    },
    chunkedTundraData() {
      let filteredNormal = this.dexData.filter(d => (d.crownTundra && !d.gmax));
      let filteredGmax = this.dexData.filter(d => (d.crownTundra && d.gmax));
      return this.chunk([...filteredNormal, ...filteredGmax], 30);
    },
    missingMons() {
      let filtered = this.dexData.filter(d => !d.inBox && d.obtainable);
      return filtered;
    },
  },
  created() {
    this.$getGapiClient().then(() => this.loadingGapi = false);
    try {
      window.setInterval(this.$refreshToken(), 2.7e+6);
    } catch (err) {
      console.error(err);
    }
  },
  mounted() {
    this.fetchDexData();
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
    isMew(d) {
      return d.name == "Mew";
    },
    isGalarSlowpoke(d) {
      return d.name == "Slowpoke" && d.form == "Galar";
    },
    createDexJson(d) {
      let spriteReg = /\=image\("/gi;
      return {
        "id": Number(d.values[0].formattedValue),
        "dexNumber": d.values[1].userEnteredValue.stringValue,
        "name": d.values[2].userEnteredValue.stringValue,
        "sprite": d.values[3].userEnteredValue.formulaValue.replace(spriteReg, '').replace('")', ''),
        "gender": d.values[4] && d.values[4].userEnteredValue ? d.values[4].userEnteredValue.stringValue : "",
        "form": d.values[5] && d.values[5].userEnteredValue ? d.values[5].userEnteredValue.stringValue : "",
        "gmax": d.values[6] && d.values[6].userEnteredValue ? true : false,
        "isleOfArmor": d.values[8] && d.values[8].userEnteredValue ? true : false,
        "crownTundra": d.values[9] && d.values[9].userEnteredValue ? true : false,
        "inBox": d.values[10].userEnteredValue.stringValue == "Yes" ? true : false,
        "obtainable": d.values[12] && d.values[12].userEnteredValue ? false : true,
        "legendsAndMyths": (d.values[13] || d.values[14]) && (d.values[13].userEnteredValue || d.values[14].userEnteredValue) ? true : false,
      };
    },
    fetchDexData() {
      fetch(`${CONFIG.SPREADSHEET_URL}?key=${CONFIG.API_KEY}&includeGridData=true&ranges=A2:O823&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async res => {
        let data = await res.json();
        let dexData =
          data.sheets[0].data[0].rowData
            .filter(d => d.values && d.values[0] && d.values[0].userEnteredValue)
            .filter(d => !(d.values[7] && d.values[7].userEnteredValue))
            .map(d => this.createDexJson(d));
        this.dexData = dexData;
      }).finally(() => this.loadingData = false);
    },
  },
});
