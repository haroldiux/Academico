<template>
  <div class="bolivia-map-container">
    <div v-if="title" class="map-header q-mb-md">
      <div class="text-h6 text-weight-bold text-primary">{{ title }}</div>
    </div>

    <svg 
      viewBox="0 0 800 533" 
      class="bolivia-map"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <!-- Pando -->
        <path
          class="department"
          :class="getDepartmentClass('pando')"
          d="M338.5,57.1l-2.4,0.5l-2.1,2.8l-5.1,3.1l-3-0.3l0.3,3.6l-3.5,2l-1.9-1.7l-1.1,1.6l1.7,3.2l-4.1-0.8L314,73l2.2,0.9l-1.1,3l-1.5,0.6l-0.9,4l-2.4,0.6l0.3,2.7l-1.9,3.6l0.9,1.3l-2.5,2.6l-6.2,2h-5.5l-2.1,5.1l0.2,2.6l-4.1,2.6h-1.9l0.6,2.4l-3.2,1.9l2.6,4.2l0.7,3.5l-0.3,5.6l-1.2,5.6l-35.6-16.2l-2,2.2l-5.9,1.4l-1.6,1.5l-0.4,3.8l-4.9,3.2l-2.9,6.3l-2.8-0.5l-2.6,3.4h-2l-31.9-54l6.3-0.8L204,79l7.7,0.4l2.6,1l8.3,0.2l-0.9,4.1l1,0.5l4.9-1.1l2.7-1.9l3.7-0.7l4.7-2.4l6.6-10.1l1.9-1.1l6.3-0.4l3.7,1.9l1.2-0.3l1.2-3.4l3.4-3.9l3.3-1.4l2.7-3.1l2.3-0.2l0.1-1.6l4.7-0.1l4.7-2.6l5.5-5.9l4.5-3.6l3.5-1.5l1.3-1.7l6.2-0.6l9-3.2l3.6-0.6l2,0.8l2.2-1.1l5.2,0.3l3.7-1.1l4.4,2.8l4.5-5.6l2.8,1l2.3,4l-1,3.6l0.3,4.3l1.3,6l-1.3,3.5L338.5,57.1z"
          @click="handleClick('pando')"
          @mouseenter="showTooltip('pando', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Beni -->
        <path
          class="department"
          :class="getDepartmentClass('beni')"
          d="M338.5,57.1l-1.9,2.7l0.5,5.6L339,68l-0.6,4l2.8,1.9l0.6,4.4l-1.3,4.2l-1.8,1.6l0.2,3.5l2.2,2.6l-0.9,2.2l2.1,4l2.4,0.4l1.1,3.8l-0.1,4.2l2-1l2.5,1.3l2.4,8.6l7,1.3l2.6,4l4.3,2.4l4.3,1.5l-0.7,4l3.2,3l6.2,0.6l2.4,1.6l3.5-0.5l4.2,1.3l2-2.4l2.1-0.7l4.9,0.7l5.5,2.7l3.5,3.9l2.6,1.3l2.8-0.1l3.4-2.3l2.1,0.6l0.9,3.4l2.5,3.8l1.6-0.3l4.1,5.1l4.1-0.8l1.5,2.3l6.3,1.7l1,1.6l4.7,0.6l4.1-0.9l2,1.1v2.9l3.7,4.6l4.6,3.7l0.7,2.3l3.8,0.3l4.9-1.1l-67.4,39.2l-13.3,4.3l0.8,3.3l0.2,6.9l-0.5,2l3,7.5l3.6,5.6l1.9,1.1l2.6,4.9l4.2,2.3l2.3,5.3l3,2.6l-44.5-2.2l-17.1,2.2l-1,0.7l-2.6,5.1l-1.8,7.3l-1,1.6l-3.2,1.6l-11.7,3.6l-6.4-0.6l-4.3-1.6L312,267l-7.6-8.5l-1.5-3.6l-9.6-9.5l-11.5-11.1v-3.1l-2.3-4.3l-4-5.2l-4.3-1.6l-0.8-8.1l-3.4-5l1.5-3.1l-2.6-5l-0.2-2l1.9-1.3l-1.2-9.8l1.7-5.8l0.3-4.4l3.4-4.3l-1-6.7l2-3.5l6-7.1l1.9-3.1l1.7-0.2l1.6-4.2l1.8-8.1l-0.7-3.2l1.3-2l-0.1-5.1l1.2-5.6l0.3-5.6l-0.7-3.5l-2.6-4.2l3.2-1.9l-0.6-2.4h1.9l4.1-2.6l-0.2-2.6l2.1-5.1h5.5l6.2-2l2.5-2.6l-0.9-1.3l1.9-3.6l-0.3-2.7l2.4-0.6l0.9-4l1.5-0.6l1.1-3l-2.2-0.9l3.3-1.9l4.1,0.8l-1.7-3.2l1.1-1.6l1.9,1.7l3.5-2l-0.3-3.6l3,0.3l5.1-3.1l2.1-2.8L338.5,57.1z"
          @click="handleClick('beni')"
          @mouseenter="showTooltip('beni', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- La Paz -->
        <path
          class="department"
          :class="getDepartmentClass('la_paz')"
          d="M286.5,128.1l0.1,5.1l-1.3,2l0.7,3.2l-1.8,8.1l-1.6,4.2l-1.7,0.2L279,154l-6,7.1l-2,3.5l1,6.7l-3.4,4.3l-0.3,4.4l-1.7,5.8l1.2,9.8l-1.9,1.3l0.2,2l2.6,5L267,207l3.5,4.9l0.8,8.1l4.3,1.6l4,5.2l2.3,4.3v3.1l11.5,11.1l-5,5.3l-0.2,8.1l2.5,3.4l0.1,1.5l2.4,2.4l-0.4,7.1l1.8,3.7l0.3,6l-1.2,1.4l-4.5,1.5l-1.5,2.8l-1.2,4.7l4.1,4.4l0.5,4.2l1.6,6.2l-4.9,3.1l-3.2-4.3l-2.3-1l-5.1,1.7l-3.9,2.4l-11,8.3l0.8,2.7l-2.5,1.7l-6.7-4.8l-5.6-2.3l-9.3,0.3l-3.2,1.4l-5,5.8l-5.6,4.4l-7.1,2.8l-7.5-2l-1.3-6l-4.9-5.3l-1.1-2.4l-0.4-6.6l-3-3.4l-2.3-0.3l1.4-3.8l3.7-2.7l2.8-1l0.6-2.6l5.9-7.2l1-2.7l5.2-2.7l0.9-1.4l-1.1-2.9l6,1.6l-0.3-4.6l-2-1.6l4.7-0.2l3.5-4.1l3.2,0.5l0.1-2.6l-1.4-1.4l-2.6,0.3l-3.6-1.1l-1.2,1.4l-2.6-5.4l2-0.4l2.6-2.3l-0.9-1.6l-7.6-0.7v-3.9l-3-2.9l-3-0.9l0.8-1.3l-3.5,0.2l-0.9-3.6l-2.6-1.6l2.3-5.5l2.9-3.8l2-1.1L208,226l-3.6-4.8l0.8-6.3l3.2-1.4l0.6-5.6l2.6-0.6l0.1-2.7l5.8-4.6l-0.8-4.7l4.3-1.4l0.4-2l-1.7-4.6l-2.3-1.8l-1.3-7.7l-3-3l2.6-1.2l1.2-3l0.6-9.5l-0.7-4.2l-0.3-10.5l4.2-4.6l2.8-0.9l1-1.9l-1.8-1.6l3.5-4.6h1.8l2.6-3.4l2.8,0.5l2.9-6.3l4.9-3.2l0.4-3.8l1.6-1.5l5.9-1.4l2-2.2L286.5,128.1z"
          @click="handleClick('la_paz')"
          @mouseenter="showTooltip('la_paz', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Cochabamba -->
        <path
          class="department"
          :class="getDepartmentClass('cochabamba')"
          d="M376.6,349l-2.5-1.6l-2.2,1.9h-3.4l-4-4.7l-4.5-1.4l-4.2,1.6l-2.9,4l-5.9-0.9l-0.7-3.1l-3.2-3.8l-3.1-1.8l-2.5-3.6l-2.9-2.2l-1.6-2.6l-6.8-5.6l-2.9,0.6l-3-4.3l-5.2,0.3l-5.3,4.2l-6.6-0.1l-3,0.6l-2-4.4l-5-6.8l-5.6-4.1l4.9-3.1l-1.6-6.2l-0.5-4.2l-4.1-4.4l1.2-4.7l1.5-2.8l4.5-1.5l1.2-1.4l-0.3-6l-1.8-3.7l0.4-7.1l-2.4-2.4l-0.1-1.5l-2.5-3.4l0.2-8.1l5-5.3l9.6,9.5l1.5,3.6l7.6,8.5l4.1,2.8l4.3,1.6l6.4,0.6l11.7-3.6l3.2-1.6l1-1.6l1.8-7.3l2.6-5.1l1-0.7l17.1-2.2l-2.4,2.6l1.7,2.8l0.7,4l-0.7,9.6l-1.3,3.7l-1.4,1.2l0.4,3.3l-1.7,3.5l1.7,5.6l3.7,4.3l4.4,3.4l4.8,2.9l4.8,5.1l0.3,3.4l-3.8,0.2l-1.6,1l-0.6,2.6l-5.2,8l-4.7,4.9l3.9,8.1l1.2,1.1l3.7,6.1l0.6,3.1l4.2,3.2l0.3,3L376.6,349z"
          @click="handleClick('cochabamba')"
          @mouseenter="showTooltip('cochabamba', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Santa Cruz -->
        <path
          class="department"
          :class="getDepartmentClass('santa_cruz')"
          d="M376.6,349l1.5-2.6l-0.3-3l-4.2-3.2l-0.6-3.1l-3.7-6.1l-1.2-1.1l-3.9-8.1l4.7-4.9l5.2-8l0.6-2.6l1.6-1l3.8-0.2l-0.3-3.4l-4.8-5.1l-4.8-2.9l-4.4-3.4l-3.7-4.3l-1.7-5.6l1.7-3.5l-0.4-3.3l1.4-1.2l1.3-3.7l0.7-9.6l-0.7-4l-1.7-2.8l2.4-2.6l44.5,2.2l-3-2.6l-2.3-5.3l-4.2-2.3l-2.6-4.9l-1.9-1.1l-3.6-5.6l-3-7.5l0.5-2l-0.2-6.9l-0.8-3.3l13.3-4.3l67.4-39.2l4.6,1.4l3.8-1.8l6.7,1l3.5-2l0.9,2.5l4.3,0.7l3.2,1.9l8,5.9l3.2,1l1.2,4.3l1.7,2.5l-1.1,3.1l-1.7,0.9l0.1,6.2l2.2,2.2l1.8,5.3l-0.9,1.8l2.6,3.1l0.4,16.5h-10.4l1.7,1.6l9,11.2l0.7,1.6l1.6,25.4l1.7,1.9l56.1,3.1l2.5-1.8l1.8,0.4l-0.7,7.7l-3.5,3.8l-0.9,2.3l0.8,5.6l-0.5,1.6l1.8,8l0.7,5.6l4.9,2.3l7.3,6.1l5.2,0.5l2,1.8l0.3,4.9l1.7,1.5l0.9,3.2l-1.2,0.7l3,5.6l2.7,6.6l2.8,2l-3.4,0.5l-7.9,23l1.8,1.1l0.3,3.7l-2.5,0.5l-11.8,23.4l0.2,1l8.3,8.1l-3.4,1.5l-6.7,4.7l0.6-6.9l-0.8-5.2l-29.9-19.8l-30.4-0.2l-58.2,12.1l-4.4,12.1l-1.7,3.6l-8.8,13l-35.4,0.1l-2.7-4.2l-4.3,3.6l-5.1-0.3l-0.4-1.5l-1.5-14.3l-0.6-1.5l-1.5-24.4l0.8-8l-4.4-0.6l-2.2,5.1l-2.5-0.3l-1.6-5.7l-4.5-2.5l-0.7-2.2l-2.3-1.8L376.6,349z"
          @click="handleClick('santa_cruz')"
          @mouseenter="showTooltip('santa_cruz', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Oruro -->
        <path
          class="department"
          :class="getDepartmentClass('oruro')"
          d="M287.6,311.2l5.6,4.1l5,6.8l2,4.4l-3.6,2.3v5.5l1.7,1l5.5,0.5L299,339l-0.7,5.4l2.2,4l4.2,3.1l6.8,1.8l1.1,1.2l2.9,7.3l4.2,5.1l0.4,1.8l-1.7,0.7l-11,1l-2.2,1.1l-3.9,3.8l-3.7,2.7l-27,12.7l-4.4,1.6l-4.8-0.5l-15.3-4.7l-9.6-3.2l2.1-3.4l2-1.4l-1.6-2l-5.8-3.5l-1.2-2l-4-3.5l-3.5-2l-2.5-3.8l1.1-3.2l-2-3.9l-1.2-5.1l0.1-4.3l-1.5-2.8l-0.9-5.8l-2-3.3l2.3-3.6l7.1-2.8l5.6-4.4l5-5.8l3.2-1.4l9.3-0.3l5.6,2.3l6.7,4.8l2.5-1.7l-0.8-2.7l11-8.3l3.9-2.4l5.1-1.7l2.3,1L287.6,311.2z"
          @click="handleClick('oruro')"
          @mouseenter="showTooltip('oruro', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Potosí -->
        <path
          class="department"
          :class="getDepartmentClass('potosi')"
          d="M300.1,326.5l3-0.6l6.6,0.1l5.3-4.2l5.2-0.3l3,4.3l2.9-0.6l6.8,5.6l1.6,2.6l2.9,2.2l2.5,3.6l3.1,1.8l-5.3-1.1l-6.4-0.7l2.3,3.3l0.8,7.6l-0.7,2.7l5.7-2.5l1,1.8l-2.5,2.5l1.2,3.5l-2.3,4.1l1.2,2.6l4.5,5.6l2.7,1.9l4.6,2.1l2.8,0.2l3.5-1l3.2,3.6l0.3,4l3.8,5.7l-4,4.9l-6.2,3.6l-6.4,1.3l-2.1,1.7l0.1,2.2l-1.7,3.4l0.1,2.3l2.4,9.3l-4,10.8l-0.1,4.4l-1.3,4.9l-0.1,5.9l0.7,2.4l4.7,4.9l2.7,2l-2.9,9.5l3.9,5.1l0.7,5.4l-8.7,0.2l-4-0.4l-5.3,1l-2-1l-4.3-4.9l-3.8-0.9l-1.6-3l-4.8-1.4l-1.7,9.2l-2.6,2.8l-11.6,3.7l-1.5,7.2l-7.9,3.7v4.6l-2.4,2.1l-2.5,4L274,501l-7.3,0.1l-3.5-1.8l-0.6-4.2l0.9-5.3l-3.1-7.5l0.2-3.6l-1.5-3.2l-0.6-3.6l-3.6-3.6l-0.6-5.7l-3.2-7.6l-0.1-8.6l-0.5-1.6l-7.3-11.3l-3.1-0.6l-2.1-2.3l-0.2-4.6l2.9-4.3l-6.9-3.6l-2.9-4.4l2.9-2.3l-1.8-3.5V405l-1.7-2.2l6.1-1.4l1.4-4.8l-0.5-2.2l-4.9-3.8l0.2-1.8l3.6-4.8l9.6,3.2l15.3,4.7l4.8,0.5l4.4-1.6l27-12.7l3.7-2.7l3.9-3.8l2.2-1.1l11-1l1.7-0.7l-0.4-1.8l-4.2-5.1l-2.9-7.3l-1.1-1.2l-6.8-1.8l-4.2-3.1l-2.2-4l0.7-5.4l4.7-3.2l-5.5-0.5l-1.7-1v-5.5L300.1,326.5z"
          @click="handleClick('potosi')"
          @mouseenter="showTooltip('potosi', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Tarija -->
        <path
          class="department"
          :class="getDepartmentClass('tarija')"
          d="M349.9,471.1l-0.7-5.4l-3.9-5.1l2.9-9.5l2.1-20.8l3.2,0.5l1,1.3l3.9,0.8l2.9,2.6l1.5-0.6l2.1-5.1l2.2,0.2l3.9,5.2l2.8-0.2l3.5,1.9l4.5-0.7l0.9-8.1l5.8,1.8l0.6,1.8l3.7,0.1l52.3,0.1l-0.1,2.3l-4.5,15.4l-7.8,25.9l-4.6-4.3l-0.4-3.9l-27.2-0.2l-3.3,1.9l-2.4-1.7l-4.4,0.2l-1.5,2.7l-1.8,5.1l-1.1,1.1l-2.4,6.4l-2.9,3.7l-1.4,5.3v2.6l-1.5,3.5l-0.9-4.7l-2.8-3l0.8-3.6l-1.8-1.8l-2.9-5.2l0.9-1.8l-1.5-2.8l-2.3-1.2l-3.4-0.1l-2.3-1.3l-6.1-1.4L349.9,471.1z"
          @click="handleClick('tarija')"
          @mouseenter="showTooltip('tarija', $event)"
          @mouseleave="hideTooltip"
        />
        <!-- Chuquisaca -->
        <path
          class="department"
          :class="getDepartmentClass('chuquisaca')"
          d="M343.1,341.1l3.2,3.8l0.7,3.1l5.9,0.9l2.9-4l4.2-1.6l4.5,1.4l4,4.7h3.4l2.2-1.9l2.5,1.6l1.7,5.5l2.3,1.8l0.7,2.2l4.5,2.5l1.6,5.7l2.5,0.3l2.2-5.1l4.4,0.6l-0.8,8l1.5,24.4l0.6,1.5l1.5,14.3l0.4,1.5l5.1,0.3l4.3-3.6l2.7,4.2l35.4-0.1l-2.2,3.8l0.1,14.9l-52.3-0.1l-3.7-0.1l-0.6-1.8l-5.8-1.8l-0.9,8.1l-4.5,0.7l-3.5-1.9l-2.8,0.2l-3.9-5.2l-2.2-0.2l-2.1,5.1l-1.5,0.6l-2.9-2.6l-3.9-0.8l-1-1.3l-3.2-0.5l-2.1,20.8l-2.7-2l-4.7-4.9l-0.7-2.4l0.1-5.9l1.3-4.9l0.1-4.4l4-10.8l-2.4-9.3l-0.1-2.3l1.7-3.4l-0.1-2.2l2.1-1.7l6.4-1.3l6.2-3.6l4-4.9l-3.8-5.7l-0.3-4l-3.2-3.6l-3.5,1l-2.8-0.2l-4.6-2.1l-2.7-1.9l-4.5-5.6l-1.2-2.6l2.3-4.1l-1.2-3.5l2.5-2.5l-1-1.8l-5.7,2.5l0.7-2.7l-0.8-7.6l-2.3-3.3l6.4,0.7L343.1,341.1z"
          @click="handleClick('chuquisaca')"
          @mouseenter="showTooltip('chuquisaca', $event)"
          @mouseleave="hideTooltip"
        />
      </g>
    </svg>

    <!-- Tooltip -->
    <div v-if="tooltipVisible" 
         class="map-tooltip" 
         :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
      <div class="tooltip-title">{{ tooltipData.name }}</div>
      <div v-if="tooltipData.sedesCount > 0" class="tooltip-content">
        <div class="text-caption text-grey-7 q-mb-xs">Haga click para ver detalles de:</div>
        <div v-for="sede in tooltipData.sedes" :key="sede.id" class="tooltip-sede-item q-mb-sm">
          <div class="row justify-between items-center text-weight-medium">
            <span>{{ sede.nombre || 'Sede' }}</span>
            <span>{{ sede.progreso }}%</span>
          </div>
          <q-linear-progress 
            :value="sede.progreso / 100" 
            :color="getProgressColor(sede.progreso)"
            rounded 
            size="4px"
          />
        </div>
      </div>
      <div v-else class="tooltip-no-sede">
        Sin sedes registradas
      </div>
    </div>

    <!-- Leyenda -->
    <div class="map-legend">
      <div class="legend-title">Nivel de Cumplimiento</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color" style="background: #22c55e;"></span>
          <span>Excelente (+80%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #eab308;"></span>
          <span>Regular (60-79%)</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #ef4444;"></span>
          <span>Crítico (-60%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  sedesData: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select-department', 'select-sede'])

// Tooltip state
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipData = ref({ name: '', progress: 0, sedesCount: 0, sedes: [] })

// Mapeo de departamentos a nombres legibles
const departmentNames = {
  pando: 'Pando',
  beni: 'Beni',
  la_paz: 'La Paz',
  cochabamba: 'Cochabamba',
  oruro: 'Oruro',
  potosi: 'Potosí',
  santa_cruz: 'Santa Cruz',
  chuquisaca: 'Chuquisaca',
  tarija: 'Tarija'
}

// Obtener progreso promedio del departamento
function getProgress(deptId) {
  const sedes = props.sedesData[deptId] || []
  if (sedes.length === 0) return 0
  const total = sedes.reduce((sum, s) => sum + (s.progreso || 0), 0)
  return Math.round(total / sedes.length)
}

function getProgressColor(progress) {
  if (progress >= 80) return 'positive'
  if (progress >= 60) return 'warning'
  return 'negative'
}

function getDepartmentClass(deptId) {
  const sedes = props.sedesData[deptId] || []
  if (sedes.length === 0) return { 'dept-empty': true }
  
  const progress = getProgress(deptId)
  return {
    'dept-high': progress >= 80,
    'dept-medium': progress >= 60 && progress < 80,
    'dept-low': progress < 60,
    'has-sede': true
  }
}

function showTooltip(deptId, event) {
  const sedes = props.sedesData[deptId] || []
  tooltipData.value = {
    name: departmentNames[deptId],
    progress: getProgress(deptId),
    sedesCount: sedes.length,
    sedes: sedes
  }
  tooltipX.value = event.clientX + 15
  tooltipY.value = event.clientY + 15
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}

function handleClick(deptId) {
  const sedes = props.sedesData[deptId] || []
  if (sedes.length === 0) return
  
  if (sedes.length === 1) {
    emit('select-sede', sedes[0])
  } else if (sedes.length > 1) {
    emit('select-department', { id: deptId, name: departmentNames[deptId], sedes })
  }
}
</script>

<style scoped>
.bolivia-map-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.bolivia-map {
  width: 100%;
  max-width: 650px;
  height: auto;
}

.department {
  fill: #f1f5f9;
  stroke: #000000;
  stroke-width: 0.8;
  cursor: default;
  transition: all 0.3s ease;
}

.department.has-sede {
  cursor: pointer;
  stroke-width: 1;
}

.department.has-sede:hover {
  stroke: var(--primary);
  stroke-width: 2.5;
  filter: brightness(1.05);
  z-index: 10;
}

.dept-empty {
  fill: #f8fafc;
}

.dept-high {
  fill: #22c55e;
}

.dept-medium {
  fill: #FFEA00; /* Amarillo Patito */
}

.dept-low {
  fill: #ef4444; /* Rojo vibrante */
}

.map-tooltip {
  position: fixed;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  min-width: 180px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  pointer-events: none;
}

.tooltip-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 10px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 6px;
}

.tooltip-sede-item {
  font-size: 0.85rem;
}

.tooltip-no-sede {
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

.map-legend {
  margin-top: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 20px;
  width: 100%;
  max-width: 500px;
}

.legend-title {
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
  font-size: 0.85rem;
  text-align: center;
}

.legend-items {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}
</style>
