export default {
  template: `
    <div
      class="box-item"
      :class="{ 
        'box-item--missing': $isAuthenticated && !entry.inBox,
        'box-item--unobtainable': !entry.obtainable,
      }"
      @click.prevent="boxClick(entry)"
    >
      <img
        :src="entry.sprite"
        class="sprite"
        :class="{ 'sprite--gmax': entry.gmax }"
        height="40"
        loading="lazy"
      >
      <md-tooltip>
        {{ entry.dexNumber }}: {{ entry.name }}<span v-if="entry.form || entry.gender">, {{ entry.form || entry.gender }}</span>
      </md-tooltip>
    </div>
  `,
  props: {
    entry: {
      required: true,
      type: Object,
    }
  },
}


