import { defineComponent, ref, computed } from 'vue';
import {
  NButton,
  NCard,
  NDivider,
  NInput,
  NModal,
  NSpace,
  NTabPane,
  NTabs,
  useMessage,
} from 'naive-ui';
import { configs, addConfig, loadConfigFile } from '~/core/config.ts';
import { Effect } from 'effect';
import { EffectRender, EffectLocalStorageDep } from '~/core/EffectDep.ts';
import { renderApiDep } from '~/core/render.api.dep.ts';
import { bowerApiDep } from '~/util/store.bower.dep.ts';

export default defineComponent({
  setup() {
    const message = useMessage();
    const showModal = ref(false);
    const name = ref('');

    const tabs = computed(() => {
      return Object.entries(configs)
        .filter(([key, value]) => {
          if (key.startsWith('__')) return false;
          else if (typeof value === 'object') {
            return true;
          } else {
            return false;
          }
        })
        .map(([key, value]) => {
          return { key, value };
        });
    });

    function add() {
      if (name.value === '') {
        message.warning('名称不能为空');
      } else if (name.value in configs) {
        message.warning('不能和已有的配置项重名');
      } else {
        addConfig(name.value);
        showModal.value = false;
      }
    }

    function validateInput(value: string) {
      if (value.startsWith('__')) {
        message.warning('名称不能以双下划线开头');
        return false;
      }
      return true;
    }

    function downConfig() {
      const text = JSON.stringify(configs, null, 2); // 要转换的字符串
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `oceanpress.json`;
      link.click();
    }

    async function importConfig() {
      const fileInput: HTMLInputElement = document.createElement('input');
      fileInput.type = 'file';
      fileInput.click();

      const file: File = await new Promise((resolve) => {
        fileInput.addEventListener('change', () => {
          resolve(fileInput.files![0]);
        });
      });

      const contents = await file.text();
      const config = JSON.parse(contents);
      if (typeof config === 'object') {
        const p = Effect.provideService(loadConfigFile(config), EffectLocalStorageDep, bowerApiDep)
        await Effect.runPromise(p)
        message.success('导入成功');
      }
    }

    return {
      showModal,
      name,
      tabs,
      add,
      validateInput,
      downConfig,
      importConfig,
    };
  },
  render() {
    return (
      <div>
        <NTabs
          v-model:value={configs.__current__}
          type="card"
          animated
          addable
          closable
          onAdd={() => (this.showModal = true)}
          onClose={(key) => delete configs[key]}
        >
          {this.tabs.map((el) => (
            <NTabPane name={el.key} tab={el.key}>
              {el.key}
            </NTabPane>
          ))}
        </NTabs>
        <NDivider></NDivider>
        <NSpace align='center'>
          <NButton onClick={this.importConfig} v-slots={{ icon: () => '📂' }}>
            导入配置文件
          </NButton>
          <NButton onClick={this.downConfig}  v-slots={{ icon: () => '📝' }}>
           导出配置文件
          </NButton>
        </NSpace>
        <NModal v-model:show={this.showModal}>
          <NCard
            style="width: 600px"
            title="输入配置名"
            bordered={false}
            size="huge"
            role="dialog"
            aria-modal="true"
          >
            <NInput
              v-model:value={this.name}
              placeholder="输入配置名"
              maxlength={30}
              show-count
              clearable
              :allow-input={this.validateInput}

            /><br /><br />
            <NButton
            type="primary"
            onClick={()=>this.add()}
            disabled={!this.validateInput(this.name)}>
            确认
          </NButton><br />
            不能以双下划线（__）开头、也不能为空、不能和已有的配置项重名
          </NCard>
        </NModal>
      </div>
    );
  },
});
