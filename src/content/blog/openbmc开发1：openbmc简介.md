---
title: openBMC开发1：openbmc简介
date: 2025-09-01 15:24:10
categories: Develop
tags:
  - openbmc
  - bmc

id: openbmc-dev-introduction
cover: https://i0.wp.com/uxiaohan.github.io/v2/2024/08/1724744026.webp
recommend: true
---

:::note
CloudFlare是一个非常优秀的CDN服务，但是CloudFlare也有一个大的毛病——大陆访问速度很慢。国外很多网站都在使用 Cloudflare CDN，但分配给中国内地访客的IP并不友好（延迟高、丢包多、速度慢）。
虽然Cloudflare公开了所有IP段，但想要在这么多IP中找到适合自己的，怕是要累死，于是就有了这个脚本。
:::

# 1  OpenBMC简介

在说OpenBMC之前，先说一下BMC（Baseboard Manager Controller，简称BMC），BMC应用了IPMI架构的智能性，是嵌入在计算机（通常是服务器）主板上的专用的微控制器。它是负责管理系统和管理软件与服务器平台硬件之间的一个接口。

根据IPMI规范，BMC需要满足如下条件：

·     具有IMPI命令;

·     提供BMC访问接口（一般是网口）;

·     提供标准化的看门狗定时器接口和看门狗内部事件产生功能;

·     提供可被其他主机组件使用的事件接收功能;

·     提供可通过相应的IPMI必选命令访问的SDR（传感器数据记录）、SEL（系统事件记录）和FRU（现场可替换单元）等功能;

简而言之，BMC就是服务器主板上一块独立的小板卡，有自己独立的处理器，和控制系统，通过IPMB、LPC（low-pin-count-interface）、SMBus等接口与主机硬件或者主机系统进行通信，并通过网络、串行/Moderm、PCI等接口传向本地主机/远程服务器提供查询和控制等功能。

OpenBMC是BMC 的Linux发行版，旨在跨越异构系统，包括企业，高性能计算（HPC），电信和云规模数据中心等系统的管理。

2014年，四名Facebook程序员在一次Facebook 黑客马拉松活动上创建了一个名为OpenBMC的原型开源BMC固件。 2015年，IBM与Rackspace合作开发了一个开源BMC固件堆栈，也称为OpenBMC。这些项目仅在名称和概念上相似。2018年3月，OpenBMC成为Linux Foundation项目并融合在IBM堆栈上。OpenBMC项目的创始组织是Microsoft、Intel、BM、Google和Facebook。并且成立了一个技术指导委员会，由五家创始公司的代表来指导该项目。IBM的Brad Bishop当选为技术指导委员会主席。2019年4月，ArmHoldings也加入了OpenBMC技术指导委员会，成为了第六名成员。

OpenBmc使用Yocto Project作为底层构建和发行的框架，并结合OpenEmbedded，systemd和D-BusOpen等技术来轻松定制管理平台。同时，OpenBMC包含一个用于与固件堆栈进行交互的Web应用程序，并添加了Redfish对硬件管理的支持。它支持常见的主机状态查看和控制、主机固件更新等功能。

![img](file:///C:/Users/Freedom/AppData/Local/Temp/msohtmlclip1/01/clip_image002.png)

# 2  IPMI简介

可以说IPMI目前是BMC的核心，BMC的远程控制都是通过ipmi协议实现。IPMI的全称是Intelligent Platform Management Interface，智能平台管理接口。IPMI规定了很多的东西，BMC是其中最重要的一个部分，此外还有一些”模块“控制器通过IPMB与BMC相连，这些”模块“控制器一般控制特定的设备，有些支持热插拔。

IPMB全称Intelligent Platform Management Bus，是一种基于I2C的串行总线，它用于BMC与模块（主板上的子卡）控制器的通信，其上传递的是IPMI命令。

![img](file:///C:/Users/Freedom/AppData/Local/Temp/msohtmlclip1/01/clip_image004.jpg)

IMPI接口基于命令/响应机制，可通过网络将机箱、传感器、固件、存储、应用等主机组件的信息进行分类传递，通过软件ID对BIOS、系统管理软件、远程终端等传感器等进行分类管理，在网络、串行/Moderm接口、IPMB（I2C）、KCS、SMIC、SMBus等不同接口上传递都使用统一的格式。

IPMI1.0于1998年9月16日发布，制定了基本规范。

IPMI1.5于2001年2月21日发布，允许IPMI系统通过串口，BMC专用的带外网口，或者与主机共享的带内网口（NC-SI）与远程管理系统通讯。

IPMI2.0于2004年2月12日发布，增加了SOL（serial over LAN）、群组管理系统、身份认证（RAKP+、SHA-1等）、基于OpenSSL/RCMP+的安全增强网络接口、固件防火墙和VLAN支持等。其中,SOL支持将BIOS输出和操作系统终端重定向到与BMC相连的串口，进而通过IPMI与远程系统管理软件连接。同时，IPMI2.0兼容系统通常还提供KVM over IP(基于IP的远程键盘鼠标显示器连接)、远程桌面和页面服务器等功能，尽管这些功能并不属于IPMI协议。

IPMI2.0修订版1.1于2013年10月1日发布，修订了勘误表，说明和附录，并增加了对IPv6寻址的支持。

更多信息请参考[英特尔IPMI技术资源网站](https://www.intel.com/content/www/us/en/servers/ipmi/ipmi-technical-resources.html)、[常见IPMI软件开源项目对比](http://ipmiutil.sf.net/docs/ipmisw-compare.htm)。

# 3  Yocto项目简介

Yocto项目是Linux基金会协作开源项目，其目标是生产工具和流程，使创建Linux发行版的嵌入式和物联网软件独立于嵌入式硬件的底层架构。该项目由Linux基金会于2010年宣布，并于2011年3月与22个组织（包括OpenEmbedded）合作启动。2018年10月，Arm Holdings与Intel合作，通过Yocto项目共享嵌入式系统的代码。

Yocto项目的目的和目标是尝试改善减轻ARM，MIPS，PowerPC和x86 / x86-64体系结构的定制Linux系统的开发人员的工作。其中的关键部分是OpenEmbedded构建系统，它使开发人员能够创建特定于其环境的自己的Linux发行版。Yocto Project和OpenEmbedded Project共享OpenEmbedded构建系统主要部分的维护权：构建引擎BitBake和核心元数据OpenEmbedded-Core。Yocto项目提供了一个称为Poky包含OpenEmbedded构建系统以及按层级分层系统排列的大量配方，可以用作定制嵌入式操作系统的全功能模板。

Yocto项目框架下还有其他几个子项目，包括CROPS，伪交叉预链接，Eclipse集成（已从2.7 版删除），火柴盒应用程序套件以及许多其它子项目。该项目的主要目标之一是这些工具之间的通用性和交互性。

该项目提供了从“微小”到功能齐全的图像的大小不同的系统，这些系统镜像可由最终用户配置和自定义。该项目鼓励与上游项目进行交互，并为OpenEmbedded-Core和BitBake以及包括Linux内核在内的众多上游项目做出了巨大贡献。生成的镜像通常在嵌入式Linux的系统中使用，这些系统是常用的系统或没有像台式机Linux系统相关的常规屏幕/输入设备的系统。

除了构建Linux系统外，还可以生成用于交叉编译的工具链和针对其自己的发行版量身定制的软件开发工具包（SDK），也称为应用程序开发者工具包（ADT）。该项目尝试与软件和供应商无关。因此，例如，可以选择要使用的包管理器格式（deb，rpm或ipk）。在构建中，存在用于各种构建时完整性/回归测试的选项，还具有在QEMU下引导和测试某些映像以验证构建的选项。构建流程如下图所示。

 

![img](file:///C:/Users/Freedom/AppData/Local/Temp/msohtmlclip1/01/clip_image006.jpg)

# 4  BMC硬件CPU

OpenBmc硬件平台最多的是Aspeed，其次是Xilinx 、NXP等。 aspeed是bmc管理平台的核心（请参考[aspeed官网](https://www.aspeedtech.com/)），类似internal和AMD的cpu，但是ASPEED是ARM架构，目前最新的soc型号是AST2600，它采用ARM V7架构的双核ARM Cotex A7。目前，已有国产芯片移植了OpenBMC，未来也会有国产的BMC芯片。

|                   | AST2600                                                      | AST2500                                                      | AST2400                                                      | AST230                                                       |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Embedded CPU      | Dual-core ARM Cortex A7    Embedded ARM Cortex M3            | 800MHz ARM11                                                 | 400MHz ARM926EJ 16KB/16KB Cache                              | 400MHz ARM926EJ 16KB/16KB Cache                              |
| SDRAM Memory      | DDR4 SDRAM with speed grade higher than  DDR4-1600Mbps    Up to 2G Byte    ECC option | 800Mbps DDR3/1600Mbps DDR4 SDRAM    16-bit data bus width    Up to 1G Byte    ECC option | 800Mbps DDR3/DDR2 SDRAM    16-bit data bus width    Up to 512 MB    ECC option | 800Mbps DDR3/DDR2 SDRAM   16-bit data bus width   Up to 512 MB   ECC option |
| Flash Memory      | SPI flash memory                                             | SPI flash memory                                             | NOR/NAND/SPI flash memory                                    | NOR/NAND/SPI flash memory                                    |
| Video-Over-IP     | Video Redirection up to 1920x1200    YUV444/YUV420 Video Compression    24 bits video compression quality | Video Redirection up to 1920x1200    YUV444/YUV420 Video Compression    24 bits video compression quality | Video Redirection up to 1920x1200    YUV444/YUV420 Video compression    24 bits video compression quality | Video Redirection up to 1920x1200   YUV444/YUV420 Video compression   24 bits video compression quality |
| USB-Over-IP       | USB 2.0 virtual hub controller with 5  devices supported    USB 1.1 HID device controller | USB 2.0 virtual hub controller with 5  devices supported    USB 1.1 HID device controller | USB 2.0 virtual hub controller with  5 any types devices supported    USB 1.1 HID device controller | USB 2.0 virtual hub controller with 5 any  types devices supported   USB 1.1 HID device controller |
| BMC               | BMC controller with IPMI 2.0/1.5  compliant    Remote Presence (iKVM)    PCIe host capability    eSPI/LPC    MCTP over PCIe    I2C/I3C/SMBus (Total 16 sets)    Virtual UART (1 set)    UART (13 sets and 1 set for FW debug)    GPIO (244 sets)    SGPIO (80 bits)    PWM (16 sets)    Secure boot engine    Fan tachometer (16 sets)    PECI 4.0    USB1.1/2.0 Host    SD/SDIO (2 ports)    Embedded SRAM    ADC (16 channels) Port 80h snoop    Watchdog (3 sets)    Timer (8 sets) | yes                                                          | yes                                                          | yes                                                          |
| VGA               | PCIe VGA/2D  Controller    1920x1200@60Hz 32bpp              | PCIe VGA/2D  Controller    1920x1200@60Hz 32bpp              | PCIe VGA/2D  Controller    1920x1200@60Hz 32bpp              | PCIe VGA/2D  controller   1920x1200@60Hz 32bpp               |
| VGA   Drivers     | RHEL    SLES    Solaris    Ubuntu    FreeBSD    Fedora    Windows Server 2012 R2 (WHQL logo'ed)    Windows Server 2016 (WHQL logo'ed)    Windows Server 2019 (WHQL logo'ed) | RHEL     SLES     Solaris    Ubuntu    FreeBSD    Fedora    Windows Server 2008 R2 (WHQL logo'ed)    Windows Server 2012 R2 (WHQL logo'ed) | Redhat RHEL 3/4/5/6    SUSE SLES 9/10/11    Solaris x86    Windows Server 2008 R2 (WHQL logo'ed)    Windows Server 2008 x86/x64 (WHQL logo'ed)    Windows Server 2003 x86/x64 (WHQL logo'ed)    Windows 2000 series (WHQL logo'ed)    Windows XP x86/x64 | Redhat RHEL 3/4/5/6   SUSE SLES 9/10/11   Solaris x86   Windows Server 2008 R2 (WHQL logo'ed)   Windows Server 2008 x86/x64 (WHQL logo'ed)   Windows Server 2003 x86/x64 (WHQL logo'ed)   Windows 2000 series (WHQL logo'ed)   Windows XP x86/x64 |
| LAN               | Quad 10/100/1000M bps MAC                                    | Dual 10/100/1000M bps MAC                                    | Dual 10/100/1000M bps MAC                                    | Dual 10/100/1000M bps MAC                                    |
| Technology        | 624-pin 21mmx21mm TFBGA package                              | 456-pin 19mmx19mm TFBGA package                              | 408-pin 19mmx19mm LFBGA package                              | 408-pin 19mmx19mm TFBGA package                              |
| Pin Compatibility | AST2620                                                      | AST2510, AST2520, AST2530                                    | AST2300, AST1300, AST1050, AST1400,  AST1250                 | AST1300, AST1050                                             |

目前，OPenBmc项目中上用的最多的芯片是AST2500系列，AST240和AST2300系列相对使用较少，并且AST2400系列已经停产。AST2600是ASPEED的第七代服务器管理处理器，也是世界上第一个采用28nm先进工艺技术的BMC SoC。AST2600采用双核ARM Cortex A7处理器，可以优化性能和计算能力。也大大降低了功耗。另外，AST2600支持Secre Boot模式和ARM Cortex A7 TrustZone，可以为客户提供出色的信息安全保护。由于AST2600系列由于上市不久，目前还在适配中。AST2600体积稍有增大，但相较于上一代增加了接近170GPIO，预示着新一代的AST可以实现更丰富的功能。

# 5  OpenBMC软件架构

BMC硬件本身就是一个计算机系统。与常用的计算机系统相比，BMC中的硬件资源非常有限。BMC硬件中CPU运行速度较慢，闪存一般在32 MB，RAM一般少于256 MB。因此，OpenBMC被设计为完整的Linux发行版，可以灵活地定制以支持不同的BMC SoC或板卡。

OpenBMC映像包括一个引导程序（u-boot），一个Linux内核，开源软件包和特定于主板的软件包：

引导加载程序和Linux内核都包括BMC SoC的各种硬件驱动程序，包括i2c驱动程序，USB驱动程序，LPC驱动、PWM驱动程序和SPI驱动程序。

开源软件包一般包括常用应用程序，例如BusyBox，i2c工具，lm传感器，OpenSSH和Python等。

用户板的软件包包括用于特定板的初始化脚本和工具。例如，它包括一个用于从EEPROM转储资产信息的工具和一个风扇控制器守护程序，用于根据环境读数控制风扇速度。

在“ Wedge”内部的BMC上运行的“ OpenBMC”软件包如下图所示。

 

![img](file:///C:/Users/Freedom/AppData/Local/Temp/msohtmlclip1/01/clip_image008.jpg)

 OpenBMC中，共有三组层：

1、通用层包括可用于不同板卡和BMC SoC的软件包。如meta-openembedded、meta-security等。

 2、SoC层包括特定于BMC SoC的软件包，例如Aspeed对AST2300 / AST2400 SoC 基础包，引导加载程序和内核都在SoC层中定义。如meta-aspeed、meta-raspberrypi、meta-xilinx等。

 3、板层包括用于不同板的封装。应用于特定Wedge的硬件配置的初始化脚本和工具，如meta-facebook、meta-ibm等。

# 6  OpenBmc源码

openbmc的git仓库地址：[openbmc仓库](https://github.com/openbmc/openbmc)，源码文件内容如下

![img](file:///C:/Users/Freedom/AppData/Local/Temp/msohtmlclip1/01/clip_image010.jpg)

matster分支下的不用layer所对应的soc如下表所示。

| BSP目录                                      | 单板型号            | SOC型号              | ARM开发版     |
| -------------------------------------------- | ------------------- | -------------------- | ------------- |
| meta-evb/meta-evb-enclustra/meta-evb-zx3-pm3 | evb-zx3-pm3         | Xilinx Zynq-7000     | arm Cortex-A9 |
| meta-evb/meta-evb-aspeed/meta-evb-ast2500    | evb-ast2500         | ASPEED AST2500       | arm1176jz-s   |
| meta-evb/meta-evb-nuvoton/meta-evb-npcm750   | evb-npcm750         | Nuvoton NPCM7XX      | arm7a-novfp   |
| meta-evb/meta-evb-raspberrypi                | RaspberryPi         | RaspberryPi          | arm1176jzf-s  |
| meta-facebook/meta-tiogapass                 | tiogapass           | ASPEED AST2500       | arm1176jz-s   |
| metahxt/metastardragon4800-rep2              | stardragon4800-rep2 | ASPEED AST2500       | arm1176jz-s   |
| meta-ibm/meta-fsp2                           | ibm-z               | fsp2                 | PPC476        |
| meta-ibm/meta-palmetto                       | palmetto            | ASPEED AST2400       | arm926ejs     |
| meta-ibm/meta-romulus                        | romulus             | ASPEED AST2500       | arm1176jz-s   |
| meta-ibm/meta-witherspoon                    | witherspoon         | ASPEED AST2500       | arm1176jz-s   |
| meta-ingrasys/meta-zaius                     | zaius               | ASPEED AST2500       | arm1176jz-s   |
| meta-inspur/meta-on5263m5                    | on5263m5            | ASPEED AST2500       | arm1176jz-s   |
| meta-intel/meta-s2600wf                      | s2600wf             | ASPEED AST2500       | arm1176jz-s   |
| meta-inventec/meta-lanyang                   | lanyang             | ASPEED AST2500       | arm1176jz-s   |
| meta-mellanox/meta-msn                       | msn                 | ASPEED AST2500       | arm1176jz-s   |
| meta-phosphor                                | qemuarm             | arm versatile 926ejs | arm926ejs     |
| meta-portwell/meta-neptune                   | neptune             | ASPEED AST2500       | arm1176jz-s   |
| meta-qualcomm/meta-centriq2400-re            | centriq2400-rep     | ASPEED AST2500       | arm1176jz-s   |
| meta-quanta/meta-f0b                         | fob                 | ASPEED AST2500       | arm1176jz-s   |
| meta-quanta/meta-gsj                         | gsj                 | Nuvoton NPCM7XX      | arm7a-novfp   |
| meta-quanta/meta-runbmc-nuvoton              | runbmc-nuvoton      | Nuvoton NPCM7XX      | arm7a-novfp   |
| meta-quanta/meta-q71l                        | quanta-q71l         | ASPEED AST2400       | arm926ejs     |
| poky/meta-poky                               | qemux86             | i586                 | x86           |

**注**：不同的分支下的BSP会有区别，同时，有效BSP必须同时包含：local.conf.sample和bblayers.conf.sample两个文件。

amd [美国超威半导体公司](https://www.amd.com/zh-hans)

ampere 安晟培半导体科技有限公司

aspeed	[ASPEED 信驊科技](http://www.aspeedtech.com/tw/)

asrock	[华擎科技](https://www.asrock.com/index.cn.asp)

bytedance	[字节跳动](https://www.bytedance.com/)

evb

facebook [脸书](https://www.facebook.com/)

fii	[工业富联（富士康）](https://www.fii-foxconn.com/#/)

google [谷歌](https://www.google.com/)

hpe[慧与](https://www.hpe.com/cn/zh/home.html) 惠普拆分出来的

IBM	[国际商业机器公司](https://www.ibm.com/cn-zh)

ingrasys 	[鸿佰科技股份有限公司](http://www.ingrasys.com/)

inspur [浪潮](https://www.inspur.com/)

intel-openbmc	[英特尔](https://www.intel.cn/content/www/cn/zh/homepage.html)

inventec	[英业达](https://ebg.inventec.com/cn) 台湾

nuvoton	[新唐科技](http://www.nuvoton.com.cn/?__locale=zh) 台湾 华邦电子拆分

quanta [广达电脑](https://www.quantatw.com/Quanta/chinese/Default.aspx)

raspberrypi [树莓派](https://www.raspberrypi.org/) 英国Raspberry Pi 慈善基金会

supermicro	[美国超微电脑股份有限公司](https://www.supermicro.org.cn/zh_cn/) 美国

tyan	[泰安电脑](https://www.tyan.com/) 台湾 神达电脑旗下

wistron	[纬创](https://www.wistron.com/) 台湾  前身是宏碁电脑

yadro	[亚德罗](https://yadro.com/en) 俄罗斯