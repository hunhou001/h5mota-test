import { Form } from '@douyinfe/semi-ui';
import { TOWER_SECTIONS, TowerSection } from '@/utils/towerSection';

export default function TowerSectionField() {
  return <Form.RadioGroup field="section" label="所属分区" type="button" initValue={TowerSection.Original}
    rules={[{ validator: (_rule, value) => TOWER_SECTIONS.some(item => item.value === value) || new Error('请选择分区') }]}>
    {TOWER_SECTIONS.map(item => <Form.Radio value={item.value} key={item.value}>{item.label}</Form.Radio>)}
  </Form.RadioGroup>;
}
