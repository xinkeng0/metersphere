<template>
  <div class="report-container h-full">
    <!-- 报告参数开始 -->
    <ReportDetailHeader :detail="detail" show-type="API" />
    <!-- 报告参数结束 -->
    <!-- 报告步骤分析和请求分析开始 -->
    <div class="analyze mb-1">
      <div class="step-analyze min-w-[522px]">
        <div class="block-title">{{ t('report.detail.api.stepAnalysis') }}</div>
        <div class="mb-2 flex items-center">
          <!-- 总数 -->
          <div class="countItem">
            <span class="mr-2 text-[var(--color-text-4)]"> {{ t('report.detail.stepTotal') }}</span>
            {{ detail.stepTotal || 0 }}
          </div>
          <!-- 通过 -->
          <div class="countItem">
            <div class="mb-[2px] mr-[4px] h-[6px] w-[6px] rounded-full bg-[rgb(var(--success-6))]"></div>
            <div class="mr-2 text-[var(--color-text-4)]">{{ t('report.detail.successCount') }}</div>
            {{ detail.stepSuccessCount || 0 }}
          </div>
          <!-- 误报 -->
          <div class="countItem">
            <div class="mb-[2px] mr-[4px] h-[6px] w-[6px] rounded-full bg-[rgb(var(--warning-6))]"></div>
            <div class="mr-2 text-[var(--color-text-4)]">{{ t('report.detail.fakeErrorCount') }}</div>
            {{ detail.stepFakeErrorCount || 0 }}
          </div>
          <!-- 失败 -->
          <div class="countItem">
            <div class="mb-[2px] mr-[4px] h-[6px] w-[6px] rounded-full bg-[rgb(var(--danger-6))]"></div>
            <div class="mr-2 text-[var(--color-text-4)]">{{ t('report.detail.errorCount') }}</div>
            {{ detail.stepErrorCount || 0 }}
          </div>
          <!-- 未执行 -->
          <div class="countItem">
            <div class="mb-[2px] mr-[4px] h-[6px] w-[6px] rounded-full bg-[var(--color-text-input-border)]"></div>
            <div class="mr-2 text-[var(--color-text-4)]">{{ t('report.detail.pendingCount') }}</div>
            {{ detail.stepPendingCount || 0 }}
          </div>
        </div>
        <StepProgress :report-detail="detail" height="8px" radius="var(--border-radius-mini)" />
        <div class="card">
          <div class="timer-card mr-2">
            <div class="text-[var(--color-text-4)]">
              <MsIcon type="icon-icon_time_outlined" class="text-[var(--color-text-4)]x mr-[4px]" size="16" />
              {{ t('report.detail.api.totalTime') }}
            </div>
            <div>
              <a-popover position="bottom" content-class="response-popover-content">
                <div class="flex items-center">
                  <div class="one-line-text ml-4 max-w-[80px] text-[18px] font-medium">{{
                    getTotalTime.split('-')[0]
                  }}</div>
                  <div class="ml-1 text-[var(--color-text-4)]">{{ getTotalTime.split('-')[1] || 'ms' }}</div>
                </div>
                <template #content>
                  <div class="min-w-[140px] max-w-[400px] p-4 text-[14px]">
                    <div class="text-[var(--color-text-4)]">{{ t('report.detail.api.totalTime') }}</div>
                    <div class="mt-2 text-[var(--color-text-1)]">
                      <span class="text-[18px] font-medium">{{ getTotalTime.split('-')[0] }}</span
                      >{{ getTotalTime.split('-')[1] || 'ms' }}</div
                    >
                  </div>
                </template>
              </a-popover>
            </div>
          </div>
          <div class="timer-card mr-2">
            <div class="text-[var(--color-text-4)]">
              <MsIcon type="icon-icon_time_outlined" class="mr-[4px] text-[var(--color-text-4)]" size="16" />
              {{ t('report.detail.api.requestTotalTime') }}
            </div>
            <div>
              <a-popover position="bottom" content-class="response-popover-content">
                <span class="one-line-text ml-4 inline-block max-w-[80px] align-middle text-[18px] font-medium">{{
                  detail.requestDuration !== null ? formatDuration(detail.requestDuration).split('-')[0] : '0'
                }}</span>

                <span class="ml-1 text-[var(--color-text-4)]">{{
                  detail.requestDuration !== null ? formatDuration(detail.requestDuration).split('-')[1] : 'ms'
                }}</span>
                <template #content>
                  <div class="min-w-[140px] max-w-[400px] p-4 text-[14px]">
                    <div class="text-[var(--color-text-4)]">{{ t('report.detail.api.requestTotalTime') }}</div>
                    <div class="mt-2 text-[var(--color-text-1)]">
                      <span class="text-[18px] font-medium">{{
                        detail.requestDuration !== null ? formatDuration(detail.requestDuration).split('-')[0] : '0'
                      }}</span
                      >{{
                        detail.requestDuration !== null ? formatDuration(detail.requestDuration).split('-')[1] : 'ms'
                      }}</div
                    >
                  </div>
                </template>
              </a-popover>
            </div>
          </div>
          <div class="timer-card min-w-[40%]">
            <div class="text-[var(--color-text-4)]">
              <MsIcon type="icon-icon_yes_outlined" class="mr-[4px] text-[var(--color-text-4)]" size="16" />
              {{ t('report.detail.api.assertPass') }}
            </div>
            <a-popover position="bottom" content-class="response-popover-content">
              <div class="flex flex-nowrap items-center">
                <div class="one-line-text max-w-[80px] text-[18px] font-medium text-[var(--color-text-1)]"
                  >{{ detail.assertionPassRate || 0 }}
                </div>
                <span v-show="detail.assertionPassRate !== 'Calculating'" class="ml-1">%</span>
                <a-divider direction="vertical" :margin="0" class="!mx-2 h-[16px]"></a-divider>
                <div class="one-line-text max-w-[80px] text-[var(--color-text-1)]">{{
                  getIndicators(detail.assertionSuccessCount) !== 'Calculating'
                    ? addCommasToNumber(detail.assertionSuccessCount)
                    : getIndicators(detail.assertionSuccessCount)
                }}</div>
                <span class="mx-1">/</span>
                <div class="one-line-text max-w-[80px] text-[var(--color-text-4)]">
                  {{
                    getIndicators(detail.assertionCount) !== 'Calculating'
                      ? addCommasToNumber(detail.assertionCount)
                      : getIndicators(detail.assertionCount)
                  }}</div
                >
              </div>
              <template #content>
                <div class="min-w-[190px] max-w-[400px] p-4 text-[14px]">
                  <div class="text-[var(--color-text-4)]">{{ t('report.detail.api.assertPass') }}</div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="text-[18px] font-medium text-[var(--color-text-1)]"
                      >{{ getIndicators(detail.assertionPassRate) }}
                      <span v-show="detail.assertionPassRate !== 'Calculating'">%</span></div
                    >
                    <div>
                      <span class="text-[var(--color-text-1)]">{{
                        getIndicators(detail.assertionSuccessCount) !== 'Calculating'
                          ? addCommasToNumber(detail.assertionSuccessCount || 0)
                          : getIndicators(detail.assertionSuccessCount)
                      }}</span>
                      <span class="text-[var(--color-text-4)]"
                        ><span class="mx-1">/</span>
                        {{
                          getIndicators(detail.assertionCount) !== 'Calculating'
                            ? addCommasToNumber(detail.assertionCount)
                            : getIndicators(detail.assertionCount)
                        }}</span
                      >
                    </div>
                  </div>
                </div>
              </template>
            </a-popover>
          </div>
        </div>
      </div>

      <div class="request-analyze">
        <div class="block-title">{{ t('report.detail.api.requestAnalysis') }}</div>
        <SetReportChart
          :legend-data="legendData"
          :options="charOptions"
          :request-total="getIndicators(detail.requestTotal) || 0"
        />
      </div>
    </div>
    <!-- 报告步骤分析和请求分析结束 -->
    <!-- 报告明细开始 -->
    <div class="report-info">
      <reportInfoHeader v-model:keyword="cascaderKeywords" v-model:active-tab="activeTab" show-type="API" />
      <TiledList :key-words="cascaderKeywords" show-type="API" :active-type="activeTab" :report-detail="detail || []" />
    </div>
    <!-- 报告明细结束 -->
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';

  import MsChart from '@/components/pure/chart/index.vue';
  import SetReportChart from './case/setReportChart.vue';
  import ReportDetailHeader from './reportDetailHeader.vue';
  import reportInfoHeader from './step/reportInfoHeaders.vue';
  import StepProgress from './stepProgress.vue';
  import TiledList from './tiledList.vue';

  import { useI18n } from '@/hooks/useI18n';
  import { addCommasToNumber, formatDuration } from '@/utils';

  import type { LegendData, ReportDetail } from '@/models/apiTest/report';

  import { getIndicators } from '../utils';

  const route = useRoute();

  const { t } = useI18n();
  const props = defineProps<{
    detailInfo?: ReportDetail;
  }>();

  const detail = ref<ReportDetail>({
    id: '',
    name: '', // 报告名称
    testPlanId: '',
    createUser: '',
    deleteTime: 0,
    deleteUser: '',
    deleted: false,
    updateUser: '',
    updateTime: 0,
    startTime: 0, // 开始时间/同创建时间一致
    endTime: 0, //  结束时间/报告执行完成
    requestDuration: 0, // 请求总耗时
    status: '', // 报告状态/SUCCESS/ERROR
    triggerMode: '', // 触发方式
    runMode: '', // 执行模式
    poolId: '', // 资源池
    poolName: '', // 资源池名称
    versionId: '',
    integrated: false, // 是否是集成报告
    projectId: '',
    environmentId: '', // 环境id
    environmentName: '', // 环境名称
    errorCount: 0, // 失败数
    fakeErrorCount: 0, // 误报数
    pendingCount: 0, // 未执行数
    successCount: 0, // 成功数
    assertionCount: 0, // 总断言数
    assertionSuccessCount: 0, // 成功断言数
    requestErrorRate: '', // 请求失败率
    requestPendingRate: '', // 请求未执行率
    requestFakeErrorRate: '', // 请求误报率
    requestPassRate: '', // 请求通过率
    assertionPassRate: '', // 断言通过率
    scriptIdentifier: '', // 脚本标识
    children: [], // 步骤列表
    stepTotal: 0, // 步骤总数
    console: '',
    stepSuccessCount: 0, // 步骤成功数
    stepErrorCount: 0, // 步骤失败数
    stepFakeErrorCount: 0, // 步骤误报数
    stepPendingCount: 0, // 步骤未执行数
  });

  const cascaderKeywords = ref<string>('');

  const getTotalTime = computed(() => {
    if (detail.value) {
      const { endTime, startTime } = detail.value;
      if (endTime && startTime && endTime !== 0 && startTime !== 0) {
        return formatDuration(endTime - startTime);
      }
      return '0';
    }
    return '0';
  });

  const legendData = ref<LegendData[]>([]);
  const charOptions = ref({
    tooltip: {
      show: false,
      trigger: 'item',
    },
    legend: {
      show: false,
    },
    series: {
      name: '',
      type: 'pie',
      radius: ['65%', '80%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        {
          value: 0,
          name: t('report.detail.api.pass'),
          itemStyle: {
            color: '#00C261',
          },
        },
        {
          value: 0,
          name: t('report.detail.api.misstatement'),
          itemStyle: {
            color: '#FFC14E',
          },
        },
        {
          value: 0,
          name: t('report.detail.api.error'),
          itemStyle: {
            color: '#ED0303',
          },
        },
        {
          value: 0,
          name: t('report.detail.api.pending'),
          itemStyle: {
            color: '#D4D4D8',
          },
        },
      ],
    },
  });
  const activeTab = ref<'tiled' | 'tab'>('tiled');

  function initOptionsData() {
    const tempArr = [
      {
        label: 'report.detail.api.pass',
        value: 'successCount',
        color: '#00C261',
        class: 'bg-[rgb(var(--success-6))]',
        rateKey: 'requestPassRate',
      },
      {
        label: 'report.detail.api.misstatement',
        value: 'fakeErrorCount',
        color: '#FFC14E',
        class: 'bg-[rgb(var(--warning-6))]',
        rateKey: 'requestFakeErrorRate',
      },
      {
        label: 'report.detail.api.error',
        value: 'errorCount',
        color: '#ED0303',
        class: 'bg-[rgb(var(--danger-6))]',
        rateKey: 'requestErrorRate',
      },
      {
        label: 'report.detail.api.pending',
        value: 'pendingCount',
        color: '#D4D4D8',
        class: 'bg-[var(--color-text-input-border)]',
        rateKey: 'requestPendingRate',
      },
    ];

    charOptions.value.series.data = tempArr.map((item: any) => {
      return {
        value: detail.value[item.value] || 0,
        name: t(item.label),
        itemStyle: {
          color: item.color,
        },
      };
    });
    legendData.value = tempArr.map((item: any) => {
      return {
        ...item,
        label: t(item.label),
        count: detail.value[item.value] || 0,
        rote: detail.value[item.rateKey] || 0,
      };
    });
  }

  watchEffect(() => {
    if (props.detailInfo) {
      detail.value = props.detailInfo;
      initOptionsData();
    }
  });
</script>

<style scoped lang="less">
  .report-container {
    padding: 16px;
    height: calc(100vh - 56px);
    background: var(--color-text-n9);
    .report-header {
      padding: 0 16px;
      height: 54px;
      border-radius: 4px;
      background: white;
      @apply mb-4 bg-white;
    }
    .analyze {
      height: 196px;
      border-radius: 4px;
      @apply mb-4 flex justify-between;
      .step-analyze {
        padding: 16px;
        width: 60%;
        height: 196px;
        border-radius: 4px;
        @apply h-full bg-white;
        .countItem {
          @apply mr-6 flex items-center;
        }
        .card {
          @apply mt-4 flex items-center justify-between;
          .timer-card {
            border-radius: 6px;
            background-color: var(--color-text-n9);
            @apply flex flex-1 flex-col p-4;
          }
        }
      }
      .request-analyze {
        padding: 16px;
        width: 40%;
        height: 100%;
        border-radius: 4px;
        @apply ml-4 h-full flex-grow bg-white;
        .chart-legend {
          .chart-legend-item {
            @apply grid grid-cols-3;
          }
          .chart-flag {
            @apply flex items-center;
            .count {
              color: var(--color-text-1);
            }
          }
        }
      }
    }
    .report-info {
      padding: 16px;
      border-radius: 4px;
      @apply bg-white;
    }
  }
  .block-title {
    @apply mb-4 font-medium;
  }
  .charts {
    top: 30%;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
    margin: auto;
  }
</style>
