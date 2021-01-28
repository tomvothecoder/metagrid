import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Tabs } from 'antd';
import { ISubscribeState, ExperimentInfo, ModelInfo, CreateSubscriptions, ViewSubscriptions, Subscription } from 'esgf-subscriptions';

enum ActiveTab {
  'AddSubs' = '1',
  'ViewSubs' = '2',
}

export interface IAppProps {
  post_url: string;
  saved_subs: Subscription[];
}

export interface IAppState {
  currentSubs: Subscription[];
  activeTab: ActiveTab;
}

export const Subscriptions = (props: IAppProps): JSX.Element => {
  const initialState: IAppState = {
    currentSubs: props.saved_subs || [],
    activeTab: ActiveTab.AddSubs,
  };

  const [state, setState] = useState<IAppState>(initialState);
  const { Content } = Layout;

  const sendRequest = async (request: Request): Promise<Record<string, unknown> | undefined> => {
    // Perform fetch to send data
    try {
      const response: Response = await fetch(request);
      if (response.status >= 200 && response.status < 300) {
        // eslint-disable-next-line
        const jsonResponse: Record<string, unknown> = await response.json();
        return jsonResponse;
      }
      // eslint-disable-next-line
      console.error(`Something went wrong with request to API server! \n\
  Status: ${response.status}. Response Text: ${response.statusText}`);
      // window.alert("Form submission failed.");
      return { error: response.statusText };
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
      return undefined;
    }
  };

  const generateRequest = (
    // eslint-disable-next-line
    formData: { [key: string]: any },
    action: string
  ): Request => {
    // Add action designation to data
    // eslint-disable-next-line
    const reqData: { [key: string]: any } = {};
    reqData.action = action;
    reqData.payload = formData;

    // Get required csrf token for posting request.
    // const csrftoken = getCookie('csrftoken');

    // eslint-disable-next-line
    const { post_url } = props;
    const request: Request = new Request(post_url, {
      method: 'POST',
      body: JSON.stringify(reqData),
      headers: {
        'X-CSRFToken': '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return request;
  };

  const deleteSubscriptions = async (
    subsToDelete: Subscription[]
  ): Promise<void> => {
    if (!state.currentSubs) {
      return; // No subscriptions to delete
    }

    const newSubs: Subscription[] = state.currentSubs.filter(
      (sub: Subscription) => {
        return !subsToDelete.includes(sub);
      }
    );
    // Update state
    setState({ ...state, currentSubs: newSubs });

    // Generate data for request
    const data = subsToDelete.map((sub: Subscription) => {
      return sub.id;
    });

    // Generate the request using data object
    const request: Request = generateRequest(data, 'unsubscribe');
    // Send request and await for response
    await sendRequest(request);
  };

  const setActivePane = (tab: ActiveTab): void => {
    setState({ ...state, activeTab: tab });
  };

  const submitSubscriptions = async (
    subState: ISubscribeState
  ): Promise<void> => {
    // Get experiment IDs
    const experimentIds: string[] = subState.experiment_id.selectedIds.map(
      (exp: ExperimentInfo): string => {
        return exp.experiment_id;
      }
    );

    // Get model IDs
    const modelIds: string[] = subState.source_id.selectedIds.map(
      (model: ModelInfo) => {
        return model.source_id;
      }
    );

    // Create subscription object to pass to backend
    const time: number = Date.now();
    const newSub: Record<string, unknown> = {
      timestamp: time,
      period: subState.period,
      name: subState.name,
      activity_id: subState.activity_id.selectedIds,
      experiment_id: experimentIds,
      frequency: subState.frequency.selectedIds,
      source_id: modelIds,
      realm: subState.realm.selectedIds,
      variable_id: subState.variable_id.selectedIds,
    };

    // Generate the request using data object
    const request: Request = generateRequest(newSub, 'subscribe');

    // Send request and await for response
    const response = await sendRequest(request);

    // Update current subscription state, using response id
    const data: Subscription[] = state.currentSubs;

    // Save in front-end state
    data.push({
      id: response ? response.id as number : -1,
      timestamp: time,
      period: subState.period,
      name: subState.name,
      activity_id: subState.activity_id.selectedIds,
      experiment_id: experimentIds,
      frequency: subState.frequency.selectedIds,
      source_id: modelIds,
      realm: subState.realm.selectedIds,
      variable_id: subState.variable_id.selectedIds,
    });

    // Update current cubscriptions state
    setState({ ...state, currentSubs: data });
    setActivePane(ActiveTab.ViewSubs);
  };

  return (
    <Layout>
      <Content>
        <Card>
          <Tabs
            activeKey={state.activeTab}
            defaultActiveKey="addSub"
            type="card"
            size="large"
            onTabClick={(key: string): void => {
              setState({ ...state, activeTab: key as ActiveTab });
            }}
          >
            <Tabs.TabPane tab="Add Subscription" key={ActiveTab.AddSubs}>
              <CreateSubscriptions submitSubscriptions={submitSubscriptions} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="View Subscriptions" key={ActiveTab.ViewSubs}>
              <ViewSubscriptions
                deleteSubscriptions={deleteSubscriptions}
                currentSubs={state.currentSubs}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};
