import { _decorator, Component, Node, Label, tween, color, Color, Prefab, instantiate, find, Vec3, AudioSource, EventKeyboard, KeyCode, Button, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Click')
export class Click extends Component {

    @property({ type: Prefab })
    public meritVirtueTips: Prefab = null;//功德提示

    @property({ type: Label })
    public meritStatistics: Label = null;//功德统计

    @property({ type: Node })
    public woodenFish: Node = null;//木鱼图片

    @property({ type: AudioSource })
    public audioSource: AudioSource = null;//点击木鱼声音

    @property({ type: Button })
    public autoClick: Button = null;//自动点击按钮

    meritNum: number = 0;
    woodenFishScale: Vec3 = null;

    isAuto: boolean = false;

    meritVirtueTipsText = "功德";
    meritStatisticsText = "今日敲击次数：";

    start() {

        //取出本地存储的功德值
        this.meritNum = localStorage.getItem("meritNum") ? parseInt(localStorage.getItem("meritNum")) : 0;

        this.meritStatistics.string = this.meritStatisticsText + this.meritNum;

        this.woodenFish.on(Node.EventType.TOUCH_START, this.ClickOnWoodenFish, this);
        this.woodenFishScale = new Vec3(this.woodenFish.scale.x, this.woodenFish.scale.y, this.woodenFish.scale.z);

        //点击按钮后
        this.autoClick.node.on(Node.EventType.TOUCH_START, this.AutoClick, this);
    }

    update(deltaTime: number) {
    }

    public AutoClick() {
        this.isAuto = !this.isAuto;
        if (this.isAuto) {
            this.autoClick.getComponent(Sprite).color = Color.GREEN;
            this.autoClick.node.getChildByName("Label").getComponent(Label).string = "自动功德：开";
            this.autoClick.node.getChildByName("Label").getComponent(Label).color = Color.WHITE;

            this.autoClick.schedule((e) => {
                this.ClickOnWoodenFish();
            }, 0.01);

        }
        else {
            this.autoClick.getComponent(Sprite).color = Color.WHITE;
            this.autoClick.node.getChildByName("Label").getComponent(Label).string = "自动功德：关";
            this.autoClick.node.getChildByName("Label").getComponent(Label).color = Color.BLACK;
            //取消自动点击
            this.autoClick.unscheduleAllCallbacks();
        }
    }

    public ClickOnWoodenFish() {

        let magnification: number = 1.0;//倍率
        //百分之五的概率获得2倍功德，百分之一的概率获得3倍功德，百分之零点五的概率获得5倍功德
        let randomNum: number = Math.random();
        if (randomNum < 0.05) {
            magnification = 2.0;
        }
        else if (randomNum < 0.06) {
            magnification = 3.0;
        }
        else if (randomNum < 0.065) {
            magnification = 5.0;
        }

        //播放声音
        this.audioSource.play();

        //实例化预制体
        let meritVirtueTipsNode = instantiate(this.meritVirtueTips);
        let meritVirtueTips: Label = meritVirtueTipsNode.getComponent(Label);
        // 放置cus
        let parent = find('Canvas');
        meritVirtueTipsNode.parent = parent;

        meritVirtueTips.color = color(meritVirtueTips.color.r, meritVirtueTips.color.g, meritVirtueTips.color.b, 0);

        this.meritNum += magnification;
        meritVirtueTips.string = this.meritVirtueTipsText + "+" + magnification;
        if (magnification > 1.0) {
            meritVirtueTips.color = color(255, 0, 0, 0);
            meritVirtueTips.fontSize *= 1.5;
        }

        // 功德提示动画
        meritVirtueTips.schedule((e) => {
            let l = meritVirtueTips.color.a;
            l += 10;
            l = l > 255 ? 255 : l;
            meritVirtueTips.color = color(meritVirtueTips.color.r, meritVirtueTips.color.g, meritVirtueTips.color.b, l);

            if (l >= 255) {
                meritVirtueTips.schedule((e1) => {
                    let l = meritVirtueTips.color.a;
                    l -= 10;
                    l = l < 0 ? 0 : l;
                    meritVirtueTips.color = color(meritVirtueTips.color.r, meritVirtueTips.color.g, meritVirtueTips.color.b, l);
                    if (l <= 0) {
                        meritVirtueTips.string = "";
                        meritVirtueTips.destroy();

                        meritVirtueTips.unschedule(e);
                        meritVirtueTips.unschedule(e1);
                    }
                }, 0.01);
            }

            let newPos: Vec3 = meritVirtueTipsNode.getPosition();
            newPos.y += 2;

            meritVirtueTipsNode.setPosition(newPos);

        }, 0.01);


        //木鱼缩放动画
        tween(this.woodenFish)
            .to(0.1, { scale: new Vec3(this.woodenFishScale.x * 0.85, this.woodenFishScale.y * 0.85, this.woodenFishScale.z * 0.85) })
            .to(0.1, { scale: this.woodenFishScale })
            .start();
        this.meritStatistics.string = this.meritStatisticsText + this.meritNum;

        //将功德值存储到本地
        localStorage.setItem("meritNum", this.meritNum.toString());
    }
}

