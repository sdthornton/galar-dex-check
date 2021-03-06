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
          {{ chunkNumber(dexChunk[0]) }}-{{ chunkNumber(dexChunk[dexChunk.length - 1]) }}
        </h4>
        <h4
          v-else-if="title == 'isle'"
          class="box-title__content"
        >
          Isle, &#8470;
          {{ chunkNumber(dexChunk[0]) }}-{{ chunkNumber(dexChunk[dexChunk.length - 1]) }}
        </h4>
        <h4
          v-else-if="title == 'tundra'"
          class="box-title__content"
        >
          Tundra, &#8470;
          {{ chunkNumber(dexChunk[0]) }}-{{ chunkNumber(dexChunk[dexChunk.length - 1]) }}
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
      return ("000" + chunk.dexNumber).slice(-3);
    }
  }
}
