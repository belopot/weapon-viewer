import React from 'react';
import PageLayout from '../layouts/PageLayout';
import MainScene from '../components/MainScene';
import './Home.scss';
import SettingUI from '../components/SettingUI';

const Home = () => (
  <PageLayout>
    <SettingUI ></SettingUI>
    <MainScene ></MainScene>
  </PageLayout>
);

export default Home;