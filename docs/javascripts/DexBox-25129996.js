import DexBoxItem from './DexBoxItem';

export default {
  name: "dex-box",
  template: `
    <article class="box md-layout-item md-layout">
      <div class="box-title md-layout-item md-size-100">
        <h4
          v-if="title == 'dex'" 
          class="box-title__content"
        >
          &#8470;
          <span v-if="dexChunk[dexChunk.length - 1].dexNumber == '-'">
            {{ chunkNumber(dexChunk[0]) }}-400&plus;
          </span>
          <span v-else>
            {{ chunkNumber(dexChunk[0]) }}-{{ chunkNumber(dexChunk[dexChunk.length - 1]) }}
          </span>
        </h4>
        <h4 
          v-else
          class="box-title__content"
          v-html="title"
        />
      </div>
      <div
        v-for="entry in dexChunk"
        class="md-layout-item box-column"
        :key="entry.id"
      >
        <dex-box-item :entry="entry" />
      </div>
      <div
        v-for="i in (30 - dexChunk.length)"
        class="md-layout-item md-size-16 box-column"
        :key="'pokemon-' + i"
      >
        <div class="box-item" />
      </div>
    </article>
  `,
  components: {
    DexBoxItem,
  },
  props: {
    title: {
      required: true,
      type: String,
    },
    dexChunk: {
      required: true,
      type: Array,
    },
  },
  methods: {
    chunkNumber(chunk) {
      return chunk.dexNumber.replace('#', '');
    }
  }
}