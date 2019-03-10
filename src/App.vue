<template>
  <div id="app">
    <custom-switch></custom-switch>
    <div class="container-item">
      <div id="airDashboard" style="width: calc(50% - 25px); height: auto"></div>
      <div id="weatherDashboard" style="width: calc(50% - 25px); height: auto"></div>
    </div>
  </div>
</template>

<script>
import CustomSwitch from 'custom-switch'
import CircleDashboard from './components/dashboard/circle-dashboard'

export default {
  components: {
    CustomSwitch
  },
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  methods: {
    getRandomArbitrary(min, max) {
      return Math.floor(Math.random() * (max - min) + min + 1);
    }
  },
  mounted() {
    let airDashboardConfig = {
      id: 'airDashboard',
      diameter: '80%',
      innerDialPadding: 40,
      pointerBackgroundWidth: 40,
      pointerBackgroundPadding: 60,
      data: {
        value: 50,
        minValue: 0,
        maxValue: 300,
        fontSize: '6rem',
        pointerColor: 'rgba(249, 180, 60)',
        color: 'rbg(255, 255, 255)',
        className: 'dashboard-value-label'
      },
      label: {
        text: '室内PM2.5',
        fontSize: '3rem',
        color: 'rgba(71, 67, 127)',
        offset: {
          x: 0,
          y: 0
        },
        className: 'dashboard-name-label'
      },
      rate: {
        text: '空气清新',
        fontSize: '1.6rem',
        color: 'rgba(255, 255, 255)',
        backgroundHeight: '3rem',
        backgroundColor: '#4CBE83',
        offset: {
          x: 0,
          y: 0
        },
        className: 'dashboard-rate-label'
      },
      isDebugger: true
    }
    this.airDashboard = new CircleDashboard(airDashboardConfig)
    this.airDashboard.initialize()
    this.airDashboardAutoUpdateTimer = setInterval(() => {
      let value = this.getRandomArbitrary(0, 300)
      this.airDashboard.update({
        data: {value},
        rate: {
          text: '污染严重',
          backgroundColor: 'rgba(249, 180, 60)'
          }
      })
    }, 2000)
  },
  beforeDestroy() {
    if (this.airDashboardAutoUpdateTimer) {
      window.clearInterval(this.airDashboardAutoUpdateTimer)
    }
  },
}
</script>

<style>
html {
  font-size: 16px;
}
#app {
  margin-top: 60px;
  color: #2c3e50;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  text-align: center;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1,
h2 {
  font-weight: normal;
}

ul {
  padding: 0;
  list-style-type: none;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
.container-item {
  width: 1000px;
  height: 1000px;
}
</style>
