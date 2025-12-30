/*
 * @Author: Han
 * @Date: 2025-04-07 11:31:34
 * @LastEditors: Han
 * @LastEditTime: 2025-04-21 14:32:19
 * @Description: 
 * 
 */
import SITE_INFO from "@/config";
import { LoadScript } from "@/utils/index";
declare const twikoo: any;

// Twikoo 评论
const TwikooFn = async (commentDOM: string) => {
  const el = document.querySelector(commentDOM);
  if (!el) return;
  // 必要配置检查
  if (!SITE_INFO.Comment.Twikoo.envId) {
    (el as HTMLElement).innerHTML = '<div class="vh-comment-error">Twikoo 未配置 envId，请在站点配置中设置。</div>';
    return;
  }
  (el as HTMLElement).innerHTML = '<section class="vh-space-loading"><span></span><span></span><span></span></section>'
  try {
    await LoadScript("https://registry.npmmirror.com/twikoo/1.6.41/files/dist/twikoo.all.min.js");
    twikoo.init({ envId: SITE_INFO.Comment.Twikoo.envId, el: commentDOM, onCommentLoaded: () => setTimeout(() => document.querySelectorAll('.vh-comment a[href="#"]').forEach(link => link.removeAttribute('href'))) })
  } catch (err) {
    console.error('[TwikooFn] 脚本加载失败', err);
    (el as HTMLElement).innerHTML = '<div class="vh-comment-error">评论脚本加载失败，请检查网络或 CDN 设置。</div>';
  }
}

// Waline 评论
const WalineFn = async (commentDOM: string, walineContainer: any) => {
  const el = document.querySelector(commentDOM);
  if (!el) return null;
  if (!SITE_INFO.Comment.Waline.serverURL) {
    (el as HTMLElement).innerHTML = '<div class="vh-comment-error">Waline 未配置 serverURL，请在站点配置中设置。</div>';
    return null;
  }
  await import('@waline/client/waline.css');
  await import('@waline/client/waline-meta.css');
  const { init } = await import('@waline/client');
  const instance = init({
    el: commentDOM, path: window.location.pathname.replace(/\/$/, ''), serverURL: SITE_INFO.Comment.Waline.serverURL,
    emoji: ['https://registry.npmmirror.com/@waline/emojis/1.3.0/files/alus', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bilibili', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/bmoji', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/qq', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/weibo', 'https://registry.npmmirror.com/@waline/emojis/1.3.0/files/soul-emoji'],
    reaction: [
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_agree.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_look_down.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sunglasses.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_pick_nose.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_awkward.png",
      "https://registry.npmmirror.com/@waline/emojis/1.3.0/files/tieba/tieba_sleep.png",
    ],
    requiredMeta: ['nick', 'mail'],
    imageUploader: async (file: any) => {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch("https://wp-cdn.4ce.cn/upload", { method: "POST", body });
      const resJson = await res.json();
      return resJson.data.link.replace('i.imgur.com', 'wp-cdn.4ce.cn/v2');
    }
  });
  if (walineContainer && typeof walineContainer === 'object') walineContainer.walineInit = instance;
  return instance;
}

// 检查是否开启评论（仅检测是否启用，以便在页面渲染占位）
const checkComment = () => {
  const CommentARR: any = Object.keys(SITE_INFO.Comment);
  const CommentItem = CommentARR.find((i: keyof typeof SITE_INFO.Comment) => SITE_INFO.Comment[i].enable);
  return CommentItem || false;
}

// 初始化评论插件
const commentInit = async (key: string, walineContainer: any) => {
  // 评论 DOM 
  const commentDOM = '.vh-comment>section'
  const targetEl = document.querySelector(commentDOM);
  if (!targetEl) return;
  // 评论列表
  const CommentList: any = { TwikooFn, WalineFn };
  try {
    const res = await CommentList[`${key}Fn`](commentDOM, walineContainer);
    // 如果是 Waline，确保把实例挂回容器，方便销毁
    if (key === 'Waline' && res && walineContainer && typeof walineContainer === 'object') {
      walineContainer.walineInit = res;
    }
  } catch (err) {
    console.error('[commentInit] 评论初始化失败', err);
    (targetEl as HTMLElement).innerHTML = '<div class="vh-comment-error">评论加载失败，请稍后再试。</div>';
  }
}

export { checkComment, commentInit }