const CLIENT_ID = "794803752624-fl20v16vgu8nreunpvhelarirm8t0sd6.apps.googleusercontent.com";
const CLIENT_SECRET = "KMKNvWGUQUO5sbLigqgMrz2k";
const API_KEY = "AIzaSyA9N5BNv8dl6CRqb6xXqfxJ_VIxEiFS7eY";
const SPREADSHEET_ID = "1Ize2mVy0wiyY92nzgawZ7065_Rgw5ZQUkmJOwf95Y18";
const SPREADSHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
const DISCOVERY_DOCS =["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const apiConfig = {
  apiKey: API_KEY,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPE,
};

// import Vue from 'vue';
import VueMaterial from 'vue-material';
// import VueGapi from 'vue-gapi';

Vue.use(VueMaterial);
// Vue.use(VueGapi, apiConfig);

/* Error Handling */
window.onerror = function(message, source, line, column, error) {
  console.log('ONE ERROR HANDLER TO RULE THEM ALL:', message);
};
Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.config.errorHandler = function(err, vm, info) {
  //oopsIDidItAgain();
  console.log(`Error: ${err.toString()}\nInfo: ${info}`);
};

const app = new Vue({
  el: "#app",
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
    isAuthenticated() {
      // return this.$isAuthenticated();
      return false;
    },
    chunkedDexData() {
      let filtered = this.dexData.filter(d => {
        return (
          !d.gmax &&
          (
            d.dexNumber != "-" ||
            this.isMew(d) ||
            this.isGalarSlowpoke(d)
          )
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedHatchableHomeData() {
      let filtered = this.dexData.filter(d => {
        return (
          d.dexNumber == "-" &&
          !d.legend &&
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
          d.legend &&
          !this.isMew(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedGmaxData() {
      let filtered = this.dexData.filter(d => d.gmax);
      return this.chunk(filtered, 30);
    },
    missingMons() {
      let filtered = this.dexData.filter(d => !d.inBox);
      return filtered;
    },
  },
  created() {
    // this.$getGapiClient().then(() => this.loadingGapi = false);
    // try {
    //   window.setInterval(this.$refreshToken(), 2.7e+6);
    // } catch (err) {
    //   console.error(err);
    // }
    this.loadingGapi = false;
  },
  mounted() {
    this.fetchDexData();
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
        "dexNumber": d.values[1].userEnteredValue.stringValue.replace('#', ''),
        "name": d.values[2].userEnteredValue.stringValue,
        "sprite": d.values[3].userEnteredValue.formulaValue.replace(spriteReg, '').replace('")', ''),
        "gender": d.values[4] && d.values[4].userEnteredValue ? d.values[4].userEnteredValue.stringValue : "",
        "form": d.values[5] && d.values[5].userEnteredValue ? d.values[5].userEnteredValue.stringValue : "",
        "gmax": d.values[6] && d.values[6].userEnteredValue ? true : false,
        "legend": d.values[8] && d.values[8].userEnteredValue ? true : false,
        "inBox": d.values[10].userEnteredValue.stringValue == "Yes" ? true : false,
      };
    },
    fetchDexData() {
      fetch(`${SPREADSHEET_URL}?key=${API_KEY}&includeGridData=true&ranges=A2:K&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async res => {
        let data = await res.json();
        let dexData =
          data.sheets[0].data[0].rowData
            .filter(d => {
              return (
                d.values && d.values[0] && d.values[0].userEnteredValue &&
                (d.values[1].userEnteredValue.stringValue.indexOf("#") == 0 || d.values[1].userEnteredValue.stringValue.indexOf("-") == 0)
              );
            })
            .filter(d => !(d.values[7] && d.values[7].userEnteredValue))
            .map(d => this.createDexJson(d));

        this.dexData = dexData;
      }).finally(() => this.loadingData = false);
    },
    boxClick(entry) {
      if (!this.isAuthenticated) {
        return;
      }

      let body = {
        values: [[ !entry.inBox ? "Yes" : "No" ]],
      };

      entry.inBox = !entry.inBox;

      // this.$getGapiClient().then(gapi => {
      //   gapi.client.sheets.spreadsheets.values.update({
      //     spreadsheetId: SPREADSHEET_ID,
      //     range: `K${entry.id}`,
      //     valueInputOption: "USER_ENTERED",
      //     resource: body,
      //   })
      //   .then()
      //   .catch(err => {
      //     alert(`Sorry, couldn't complete that "in box" update.`);
      //     entry.inBox = !entry.inBox;
      //   });
      // });
    },
    login() {
      // this.$login();
    },
  },
});
