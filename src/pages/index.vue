<template>
  <div class="index-page">
    <section>
      <article>
        <h1 class="">基础底图</h1>
        <div class="item">
          <img
            @click="routePage('amap')"
            src="@/assets/images/index/3.png"
            alt=""
          />
          <div>高德地图</div>
        </div>
        <div class="item">
          <img
            @click="routePage('bmap')"
            src="@/assets/images/index/4.png"
            alt=""
          />
          <div>百度地图</div>
        </div>
        <div class="item">
          <img
            @click="routePage('mapBase')"
            src="@/assets/images/index/2.png"
            alt=""
          />
          <div>天地图</div>
        </div>
      </article>

       <article>
        <h1 class="">打点</h1>
        <div class="item">
          <img
            @click="routePage('billboard')"
            src="@/assets/images/index/3.png"
            alt=""
          />
          <div>顶牌</div>
        </div>
      </article>

      <article>
        <h1 class="">嵌入TOS</h1>
        <div class="item">
          <img
            @click="routePage('tos')"
            src="@/assets/images/index/1.png"
            alt=""
          />
          <div>嵌入TOS</div>
        </div>
      </article>
    </section>
  </div>
</template>
<script>
export default {
  methods: {
    routePage(page) {
      this.$router.push('/' + page)
    }
  }
}
</script>
<style scoped>
.index-page {
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #fff;
}

h1 {
  font-size: 18px;
  color: #fff;
  clear: both;
}

article .item img {
  height: 180px;
  width: auto;
  box-sizing: border-box;
}

article .item {
  width: 300px;
  height: 200px;
  text-align: center;
  /* border: 1px solid #334765; */
  float: left;
}

article .item > div {
  padding: 6px 0;
}
</style>