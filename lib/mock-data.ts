// 课小宝 Mock Data - 真实用户场景数据

// C端家长数据
export const children = [
  {
    id: '1',
    name: '朵朵',
    avatar: '/images/avatars/child-duoduo-photo.jpg',
    age: 7,
    grade: '一年级',
  },
  {
    id: '2',
    name: '小宝',
    avatar: '/images/avatars/child-xiaobao-photo.jpg',
    age: 5,
    grade: '大班',
  },
]

export const courses = [
  {
    id: '1',
    childId: '1',
    name: '钢琴启蒙',
    institution: '七彩音乐艺术中心',
    teacher: '李老师',
    color: '#F87E31',
    totalClasses: 48,
    remainingClasses: 32,
    price: 150,
  },
  {
    id: '2',
    childId: '1',
    name: '创意美术',
    institution: '小画家美术工作室',
    teacher: '张老师',
    color: '#0E70C0',
    totalClasses: 24,
    remainingClasses: 8,
    price: 120,
  },
  {
    id: '3',
    childId: '1',
    name: '少儿编程',
    institution: '酷码编程',
    teacher: '王老师',
    color: '#10B981',
    totalClasses: 36,
    remainingClasses: 28,
    price: 200,
  },
  {
    id: '4',
    childId: '2',
    name: '跆拳道',
    institution: '龙武跆拳道馆',
    teacher: '陈教练',
    color: '#8B5CF6',
    totalClasses: 60,
    remainingClasses: 45,
    price: 80,
  },
  {
    id: '5',
    childId: '2',
    name: '篮球课',
    institution: '跃动篮球训练营',
    teacher: '周教练',
    color: '#EF4444',
    totalClasses: 32,
    remainingClasses: 20,
    price: 110,
  },
  {
    id: '6',
    childId: '2',
    name: '足球课',
    institution: '绿茵少年足球俱乐部',
    teacher: '赵教练',
    color: '#14B8A6',
    totalClasses: 36,
    remainingClasses: 24,
    price: 100,
  },
]

// courseType: 'institution'=机构课  'self'=自主记账
// 生成未来3个月课程（2026-05-19 ~ 2026-08-19）
function generateSchedule() {
  const baseSchedule: Array<{
    courseId: string
    courseName: string
    institution: string
    teacher: string
    classroom: string
    startTime: string
    endTime: string
    childId: string
    color: string
    courseType: 'institution' | 'self'
    dayOfWeek: number // 0=周日 1=周一 ... 6=周六
  }> = [
    // 钢琴启蒙：周二、周五 10:00-11:00
    { courseId: '1', courseName: '钢琴启蒙', institution: '七彩音乐艺术中心', teacher: '李老师', classroom: '3号琴房', startTime: '10:00', endTime: '11:00', childId: '1', color: '#F87E31', courseType: 'institution', dayOfWeek: 2 },
    { courseId: '1', courseName: '钢琴启蒙', institution: '七彩音乐艺术中心', teacher: '李老师', classroom: '3号琴房', startTime: '10:00', endTime: '11:00', childId: '1', color: '#F87E31', courseType: 'institution', dayOfWeek: 5 },
    // 创意美术：周六 14:00-15:30
    { courseId: '2', courseName: '创意美术', institution: '小画家美术工作室', teacher: '张老师', classroom: '创意教室A', startTime: '14:00', endTime: '15:30', childId: '1', color: '#0E70C0', courseType: 'institution', dayOfWeek: 6 },
    // 少儿编程：周日 09:00-10:30
    { courseId: '3', courseName: '少儿编程', institution: '酷码编程', teacher: '王老师', classroom: '电脑室1', startTime: '09:00', endTime: '10:30', childId: '1', color: '#10B981', courseType: 'institution', dayOfWeek: 0 },
    // 篮球课：周四 17:00-18:00
    { courseId: '5', courseName: '篮球课', institution: '跃动篮球训练营', teacher: '周教练', classroom: '室内篮球馆A场', startTime: '17:00', endTime: '18:00', childId: '2', color: '#EF4444', courseType: 'institution', dayOfWeek: 4 },
    // 足球课：周二 17:30-18:30
    { courseId: '6', courseName: '足球课', institution: '绿茵少年足球俱乐部', teacher: '赵教练', classroom: '1号足球场', startTime: '17:30', endTime: '18:30', childId: '2', color: '#14B8A6', courseType: 'institution', dayOfWeek: 2 },
    // 跆拳道：周六 16:00-17:30
    { courseId: '4', courseName: '跆拳道', institution: '龙武跆拳道馆', teacher: '陈教练', classroom: '训练馆', startTime: '16:00', endTime: '17:30', childId: '2', color: '#8B5CF6', courseType: 'self', dayOfWeek: 6 },
  ]

  const result: Array<{
    id: string
    courseId: string
    courseName: string
    institution: string
    teacher: string
    classroom: string
    date: string
    startTime: string
    endTime: string
    childId: string
    status: 'upcoming' | 'completed' | 'leave'
    color: string
    courseType: 'institution' | 'self'
  }> = []

  // 从2026-05-19开始，生成13周（约3个月）的课程
  const startDate = new Date('2026-05-19')
  let id = 1

  for (let week = 0; week < 13; week++) {
    for (const base of baseSchedule) {
      const date = new Date(startDate)
      // 计算本周该天的日期
      const currentDow = startDate.getDay()
      let diff = base.dayOfWeek - currentDow
      if (diff < 0) diff += 7
      date.setDate(startDate.getDate() + week * 7 + diff)
      
      const dateStr = date.toISOString().split('T')[0]
      const status =
        (base.courseId === '1' && dateStr === '2026-07-03') ||
        (base.courseId === '6' && dateStr === '2026-06-30')
          ? 'leave'
          : 'upcoming'

      result.push({
        id: String(id++),
        courseId: base.courseId,
        courseName: base.courseName,
        institution: base.institution,
        teacher: base.teacher,
        classroom: base.classroom,
        date: dateStr,
        startTime: base.startTime,
        endTime: base.endTime,
        childId: base.childId,
        status,
        color: base.color,
        courseType: base.courseType,
      })
    }
  }

  // 按日期排序
  result.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  return result
}

export const schedule = generateSchedule()

// status: 'attended'=已消课  'absent'=未上课  'leave'=请假  'makeup'=调休补课
export const classRecords = [
  {
    id: '1',
    childId: '1',
    courseId: '1',
    courseName: '钢琴启蒙',
    date: '2026-05-16',
    startTime: '10:00',
    deduction: 1,
    source: 'institution',  // 'institution'=机构同步  'self'=自主记账
    note: '练习《小星星》，节奏把握很好',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '2',
    childId: '1',
    courseId: '2',
    courseName: '创意美术',
    date: '2026-05-16',
    startTime: '14:00',
    deduction: 1,
    source: 'institution',
    note: '完成水彩画《春天》',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '3',
    childId: '1',
    courseId: '3',
    courseName: '少儿编程',
    date: '2026-05-17',
    startTime: '09:00',
    deduction: 1,
    source: 'institution',
    note: '学习了循环语句',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '4',
    childId: '2',
    courseId: '4',
    courseName: '跆拳道',
    date: '2026-05-17',
    startTime: '16:00',
    deduction: 1,
    source: 'self',
    note: '品势练习',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '5',
    childId: '1',
    courseId: '1',
    courseName: '钢琴启蒙',
    date: '2026-05-13',
    startTime: '10:00',
    deduction: 1,
    source: 'institution',
    note: '音阶练习',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '6',
    childId: '1',
    courseId: '1',
    courseName: '钢琴启蒙',
    date: '2026-05-09',
    startTime: '10:00',
    deduction: 0,
    source: 'institution',
    note: '已申请请假',
    status: 'leave',
    makeupFromId: null,
  },
  {
    id: '7',
    childId: '1',
    courseId: '1',
    courseName: '钢琴启蒙',
    date: '2026-05-10',
    startTime: '10:00',
    deduction: 1,
    source: 'institution',
    note: '调休补课',
    status: 'makeup',
    makeupFromId: '6',
  },
  {
    id: '8',
    childId: '1',
    courseId: '2',
    courseName: '创意美术',
    date: '2026-05-09',
    startTime: '14:00',
    deduction: 1,
    source: 'institution',
    note: '素描基础',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '9',
    childId: '2',
    courseId: '4',
    courseName: '跆拳道',
    date: '2026-05-10',
    startTime: '16:00',
    deduction: 1,
    source: 'self',
    note: '',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '10',
    childId: '1',
    courseId: '3',
    courseName: '少儿编程',
    date: '2026-05-10',
    startTime: '09:00',
    deduction: 1,
    source: 'institution',
    note: '条件判断语句',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '11',
    childId: '2',
    courseId: '5',
    courseName: '篮球课',
    date: '2026-05-14',
    startTime: '17:00',
    deduction: 1,
    source: 'institution',
    note: '运球节奏更稳定，能完成连续变向',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '12',
    childId: '2',
    courseId: '6',
    courseName: '足球课',
    date: '2026-05-13',
    startTime: '17:30',
    deduction: 1,
    source: 'institution',
    note: '带球绕桩完成度高，传球方向感更好',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '13',
    childId: '2',
    courseId: '5',
    courseName: '篮球课',
    date: '2026-05-11',
    startTime: '17:00',
    deduction: 1,
    source: 'institution',
    note: '投篮动作有进步，敢于和同伴配合',
    status: 'attended',
    makeupFromId: null,
  },
  {
    id: '14',
    childId: '2',
    courseId: '6',
    courseName: '足球课',
    date: '2026-06-30',
    startTime: '17:30',
    deduction: 0,
    source: 'institution',
    note: '已请假，课时暂不扣除',
    status: 'leave',
    makeupFromId: null,
  },
]

// 勋章数据 - 根据孩子形象定制
export const medals = {
  duoduo: [
    {
      id: '1',
      name: '坚持练习',
      icon: '🎹',
      description: '连续7天完成钢琴练习',
      earnedAt: '2026-03-20',
      color: '#F87E31',
      category: 'persistence',
    },
    {
      id: '2',
      name: '音乐小达人',
      icon: '🎵',
      description: '完成10节钢琴课程',
      earnedAt: '2026-03-15',
      color: '#0E70C0',
      category: 'milestone',
    },
    {
      id: '3',
      name: '全勤之星',
      icon: '⭐',
      description: '本月课程全勤出席',
      earnedAt: '2026-03-01',
      color: '#10B981',
      category: 'attendance',
    },
    {
      id: '4',
      name: '创意小画家',
      icon: '🎨',
      description: '完成3幅独立创作',
      earnedAt: '2026-02-28',
      color: '#8B5CF6',
      category: 'creative',
    },
    {
      id: '5',
      name: '进步飞速',
      icon: '🚀',
      description: '老师评价进步明显',
      earnedAt: '2026-02-20',
      color: '#EC4899',
      category: 'progress',
    },
  ],
  xiaobao: [
    {
      id: '1',
      name: '运动小将',
      icon: '🏀',
      description: '连续完成篮球基础训练',
      earnedAt: '2026-03-18',
      color: '#EF4444',
      category: 'persistence',
    },
    {
      id: '2',
      name: '配合之星',
      icon: '⚽',
      description: '足球课主动传球给队友',
      earnedAt: '2026-03-10',
      color: '#14B8A6',
      category: 'engagement',
    },
    {
      id: '3',
      name: '专注练习',
      icon: '🥋',
      description: '跆拳道动作练习保持专注',
      earnedAt: '2026-03-05',
      color: '#8B5CF6',
      category: 'progress',
    },
  ],
}

export const growthPhotos = [
  {
    id: '1',
    childId: '1',
    url: '/images/growth-timeline/piano-practice-focused.jpg',
    date: '2026-03-25',
    course: '钢琴启蒙',
    description: '认真练习中',
  },
  {
    id: '2',
    childId: '1',
    url: '/images/growth-timeline/art-spring-complete.jpg',
    date: '2026-03-24',
    course: '创意美术',
    description: '完成春天主题画作',
  },
  {
    id: '3',
    childId: '1',
    url: '/images/growth-feed/coding-robot-maze.jpg',
    date: '2026-03-22',
    course: '少儿编程',
    description: '完成机器人迷宫挑战',
  },
  {
    id: '4',
    childId: '2',
    url: '/images/growth-feed/basketball-dribble-real.png',
    date: '2026-03-25',
    course: '篮球课',
    description: '连续运球更稳了',
  },
  {
    id: '5',
    childId: '2',
    url: '/images/growth-feed/football-dribble-real.png',
    date: '2026-03-23',
    course: '足球课',
    description: '带球绕桩完成得很流畅',
  },
  {
    id: '6',
    childId: '2',
    url: '/images/growth-feed/taekwondo-xiaobao-real.png',
    date: '2026-03-21',
    course: '跆拳道',
    description: '品势动作更有力量',
  },
]

export const childGrowthProfiles = {
  '1': {
    reportTitle: '3月成长报告',
    reportSummary: '本月朵朵在钢琴学习上表现出色，《小星星》演奏已经非常流畅，节奏感明显提升。美术课上色彩运用更加大胆，少儿编程也能独立完成机器人迷宫任务。建议继续保持每日练琴15分钟的好习惯。',
    posterSummary: '《小星星》弹得更稳了，也完成了春天主题作品和机器人迷宫挑战。',
    tags: ['坚持练习', '节奏更稳', '大胆创作'],
  },
  '2': {
    reportTitle: '3月成长报告',
    reportSummary: '本月小宝在运动课上进入状态很快，篮球运球节奏更稳定，足球带球绕桩的协调性明显提升。跆拳道练习中能主动调整站姿和出拳路线，建议继续保持热身和拉伸习惯。',
    posterSummary: '运球更稳，带球更顺，跆拳道动作也越来越有力量。',
    tags: ['动作协调', '主动配合', '体能进步'],
  },
}

// 家长账号资料
export const parentProfile = {
  nickname: '妈妈',
  avatar: '/images/avatars/parent-mom.jpg',
}

// 成长动态（老师课程反馈 + 课堂照片）
export const growthFeed = [
  {
    id: 'gf1',
    childId: '1',
    childName: '朵朵',
    teacher: '李老师',
    teacherAvatar: '/images/avatars/teacher-lixue-photo.jpg',
    course: '钢琴启蒙',
    date: '2026-06-27 20:15',
    content: '朵朵今天表现非常棒，课堂互动积极，新学的《小星星》已经能完整弹奏，手型也越来越标准了！',
    images: [
      '/images/growth-feed/piano-twinkle-practice.jpg',
      '/images/growth-feed/piano-hand-shape.jpg',
      '/images/growth-feed/piano-complete-piece.jpg',
    ],
  },
  {
    id: 'gf2',
    childId: '1',
    childName: '朵朵',
    teacher: '张老师',
    teacherAvatar: '/images/avatars/teacher-chenmei-photo.jpg',
    course: '创意美术',
    date: '2026-06-25 16:40',
    content: '今天完成了春天主题的水彩画，配色大胆有创意，老师给朵朵的想象力点个赞！',
    images: [
      '/images/growth-feed/art-spring-watercolor.jpg',
      '/images/growth-feed/art-spring-finished.jpg',
    ],
  },
  {
    id: 'gf3',
    childId: '1',
    childName: '朵朵',
    teacher: '王老师',
    teacherAvatar: '/images/avatars/teacher-wangming-photo.jpg',
    course: '少儿编程',
    date: '2026-06-22 19:30',
    content: '本节课学习了循环指令，朵朵独立完成了小机器人走迷宫的任务，逻辑思维进步明显。',
    images: [
      '/images/growth-feed/coding-robot-maze.jpg',
    ],
  },
  {
    id: 'gf4',
    childId: '2',
    childName: '小宝',
    teacher: '周教练',
    teacherAvatar: '/images/avatars/coach-basketball-zhou.png',
    course: '篮球课',
    date: '2026-06-27 18:20',
    content: '小宝今天的运球节奏更稳了，能连续完成原地低运球和绕锥变向，投篮前也会主动调整脚步，课堂专注度很不错。',
    images: [
      '/images/growth-feed/basketball-dribble-real.png',
      '/images/growth-feed/basketball-shoot-real.png',
      '/images/growth-feed/basketball-team-real.png',
    ],
  },
  {
    id: 'gf5',
    childId: '2',
    childName: '小宝',
    teacher: '赵教练',
    teacherAvatar: '/images/avatars/coach-football-zhao.png',
    course: '足球课',
    date: '2026-06-25 18:40',
    content: '足球课上小宝完成了带球绕桩和短距离传接球练习，奔跑时身体协调性更好了，也开始主动观察队友的位置。',
    images: [
      '/images/growth-feed/football-dribble-real.png',
      '/images/growth-feed/football-pass-real.png',
    ],
  },
  {
    id: 'gf6',
    childId: '2',
    childName: '小宝',
    teacher: '陈教练',
    teacherAvatar: '/images/avatars/coach-taekwondo-chen.png',
    course: '跆拳道',
    date: '2026-06-22 17:55',
    content: '今天小宝练习前踢和品势组合时很认真，动作收放更干净，听到口令后能快速站好预备姿势，体能和专注力都有进步。',
    images: [
      '/images/growth-feed/taekwondo-xiaobao-real.png',
    ],
  },
]

// 家长消息通知
export const parentMessages = [
  {
    id: 'm1',
    type: 'class',
    title: '上课提醒',
    content: '朵朵的「钢琴启蒙」将于今天 10:00 开始，请提前 10 分钟到达 3 号琴房。',
    time: '今天 09:00',
    unread: true,
  },
  {
    id: 'm2',
    type: 'feedback',
    title: '新的课程反馈',
    content: '李老师给朵朵发来了「钢琴启蒙」的课堂反馈与照片，快去看看吧！',
    time: '昨天 20:15',
    unread: true,
  },
  {
    id: 'm3',
    type: 'institution',
    title: '机构通知',
    content: '七彩音乐艺术中心：暑期班开始报名啦，老学员续费享 9 折优惠。',
    time: '06-25 14:30',
    unread: false,
  },
  {
    id: 'm4',
    type: 'class',
    title: '课时提醒',
    content: '朵朵的「创意美术」仅剩 8 课时，建议及时续费以免影响上课。',
    time: '06-24 10:00',
    unread: false,
  },
]

// B端 - 课程目录（科目层级，是班次的上级）
export const courseCatalog = [
  {
    id: 'c1',
    name: '钢琴启蒙',
    category: '音乐',
    color: '#F87E31',
    teacherId: '1',
    teacher: '李雪',
    price: 180,
    duration: 60,
    classCount: 2,
    studentCount: 8,
    desc: '适合3-6岁零基础儿童，培养音乐感知力',
  },
  {
    id: 'c2',
    name: '钢琴进阶',
    category: '音乐',
    color: '#10B981',
    teacherId: '1',
    teacher: '李雪',
    price: 220,
    duration: 60,
    classCount: 1,
    studentCount: 4,
    desc: '适合有一定基础的学员，强化演奏技巧',
  },
  {
    id: 'c3',
    name: '乐理基础',
    category: '音乐',
    color: '#0E70C0',
    teacherId: '2',
    teacher: '王明',
    price: 150,
    duration: 90,
    classCount: 1,
    studentCount: 6,
    desc: '系统学习音乐理论，提升综合音乐素养',
  },
  {
    id: 'c4',
    name: '小提琴入门',
    category: '音乐',
    color: '#8B5CF6',
    teacherId: '2',
    teacher: '王明',
    price: 200,
    duration: 60,
    classCount: 1,
    studentCount: 3,
    desc: '从持弓姿势开始，系统学习小提琴演奏',
  },
]

// B端 - 班次（隶属于课程，包含具体的上课计划）
export const classSessions = [
  {
    id: 'cs1',
    courseId: 'c1',
    courseName: '钢琴启蒙',
    name: '钢琴启蒙A班',
    type: '小班课',
    color: '#F87E31',
    teacherId: '1',
    teacher: '李雪',
    classroom: '1号琴房',
    maxStudents: 6,
    studentIds: ['1', '4'],
    // 每个课次独立配置：dayOfWeek 0=周日 1=周一…6=周六
    // 确保每天都有课，方便体验
    sessions: [
      { dayOfWeek: 0, time: '10:00', duration: 60 },
      { dayOfWeek: 1, time: '10:00', duration: 60 },
      { dayOfWeek: 2, time: '10:00', duration: 60 },
      { dayOfWeek: 3, time: '10:00', duration: 60 },
      { dayOfWeek: 4, time: '10:00', duration: 60 },
      { dayOfWeek: 5, time: '10:00', duration: 60 },
      { dayOfWeek: 6, time: '10:00', duration: 60 },
    ],
    status: 'active',
    startDate: '2026-03-01',
  },
  {
    id: 'cs2',
    courseId: 'c1',
    courseName: '钢琴启蒙',
    name: '钢琴启蒙B班',
    type: '1对1',
    color: '#F87E31',
    teacherId: '1',
    teacher: '李雪',
    classroom: '2号琴房',
    maxStudents: 1,
    studentIds: ['3'],
    sessions: [
      { dayOfWeek: 0, time: '11:00', duration: 60 },
      { dayOfWeek: 1, time: '11:00', duration: 60 },
      { dayOfWeek: 2, time: '11:00', duration: 60 },
      { dayOfWeek: 3, time: '11:00', duration: 60 },
      { dayOfWeek: 4, time: '11:00', duration: 60 },
      { dayOfWeek: 5, time: '11:00', duration: 60 },
      { dayOfWeek: 6, time: '11:00', duration: 60 },
    ],
    status: 'active',
    startDate: '2026-03-01',
  },
  {
    id: 'cs3',
    courseId: 'c2',
    courseName: '钢琴进阶',
    name: '钢琴进阶班',
    type: '小班课',
    color: '#10B981',
    teacherId: '1',
    teacher: '李雪',
    classroom: '1号琴房',
    maxStudents: 6,
    studentIds: ['2'],
    sessions: [
      { dayOfWeek: 0, time: '14:00', duration: 60 },
      { dayOfWeek: 1, time: '14:00', duration: 60 },
      { dayOfWeek: 2, time: '14:00', duration: 60 },
      { dayOfWeek: 3, time: '14:00', duration: 60 },
      { dayOfWeek: 4, time: '14:00', duration: 60 },
      { dayOfWeek: 5, time: '14:00', duration: 60 },
      { dayOfWeek: 6, time: '14:00', duration: 60 },
    ],
    status: 'active',
    startDate: '2026-02-15',
  },
  {
    id: 'cs4',
    courseId: 'c3',
    courseName: '乐理基础',
    name: '乐理基础班',
    type: '大班课',
    color: '#0E70C0',
    teacherId: '2',
    teacher: '王明',
    classroom: '综合教室',
    maxStudents: 15,
    studentIds: ['1', '2', '3', '4'],
    sessions: [
      { dayOfWeek: 0, time: '14:00', duration: 90 },
      { dayOfWeek: 2, time: '14:00', duration: 90 },
      { dayOfWeek: 4, time: '14:00', duration: 90 },
    ],
    status: 'active',
    startDate: '2026-01-10',
  },
  {
    id: 'cs5',
    courseId: 'c4',
    courseName: '小提琴入门',
    name: '小提琴入门班',
    type: '小班课',
    color: '#8B5CF6',
    teacherId: '2',
    teacher: '王明',
    classroom: '小提琴教室',
    maxStudents: 6,
    studentIds: ['2', '3'],
    sessions: [
      { dayOfWeek: 2, time: '15:00', duration: 60 },
      { dayOfWeek: 6, time: '09:00', duration: 60 },
    ],
    status: 'active',
    startDate: '2026-02-01',
  },
]

// B端机构数据
export const institutionInfo = {
  id: '1',
  name: '七彩音乐艺术中心',
  logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=qicai',
  address: '杭州市西湖区文三路168号',
  phone: '0571-88888888',
  studentCount: 156,
  teacherCount: 8,
  classCount: 12,
  monthlyRevenue: 89600,
  version: 'pro',
}

export const students = [
  {
    id: '1',
    name: '朵朵',
    avatar: '/images/avatars/child-duoduo-photo.jpg',
    parentName: '王女士',
    parentPhone: '138****8888',
    courses: ['钢琴启蒙'],
    remainingClasses: 32,
    totalClasses: 48,
    status: 'normal',
    joinDate: '2025-09-01',
    isBound: true,
  },
  {
    id: '2',
    name: '小明',
    avatar: '/images/avatars/child-xiaoming.jpg',
    parentName: '李先生',
    parentPhone: '139****6666',
    courses: ['钢琴进阶', '乐理基础'],
    remainingClasses: 5,
    totalClasses: 48,
    status: 'warning',
    joinDate: '2025-06-15',
    isBound: true,
  },
  {
    id: '3',
    name: '欣欣',
    avatar: '/images/avatars/child-xinxin.jpg',
    parentName: '张女士',
    parentPhone: '137****5555',
    courses: ['古筝入门'],
    remainingClasses: 0,
    totalClasses: 24,
    status: 'expired',
    joinDate: '2025-03-20',
    isBound: false,
  },
  {
    id: '4',
    name: '豆豆',
    avatar: '/images/avatars/child-doudou.jpg',
    parentName: '赵先生',
    parentPhone: '136****4444',
    courses: ['钢琴启蒙'],
    remainingClasses: 18,
    totalClasses: 24,
    status: 'normal',
    joinDate: '2025-11-01',
    isBound: false,
  },
  {
    id: '5',
    name: '琳琳',
    avatar: '/images/avatars/child-linlin.jpg',
    parentName: '刘女士',
    parentPhone: '135****3333',
    courses: ['钢琴启蒙'],
    remainingClasses: 0,
    totalClasses: 36,
    status: 'expired',
    joinDate: '2024-12-01',
    isBound: true,
  },
]

export const teachers = [
  {
    id: '1',
    name: '李雪',
    avatar: '/images/avatars/teacher-lixue-photo.jpg',
    title: '钢琴教师',
    specialty: '儿童钢琴启蒙',
    studentCount: 28,
    weeklyClasses: 24,
    phone: '138****0001',
    role: 'admin',   // admin = 机构管理员（同时是教师），teacher = 普通教师
    status: 'active', // active | invited
    joinDate: '2023-09-01',
  },
  {
    id: '2',
    name: '王明',
    avatar: '/images/avatars/teacher-wangming-photo.jpg',
    title: '小提琴教师',
    specialty: '小提琴演奏',
    studentCount: 15,
    weeklyClasses: 18,
    phone: '139****0002',
    role: 'teacher',
    status: 'active',
    joinDate: '2024-03-15',
  },
  {
    id: '3',
    name: '陈美',
    avatar: '/images/avatars/teacher-chenmei-photo.jpg',
    title: '声乐教师',
    specialty: '儿童声乐',
    studentCount: 0,
    weeklyClasses: 0,
    phone: '137****0003',
    role: 'teacher',
    status: 'invited', // 已发出邀请，待接受
    joinDate: null,
  },
]

// 教师核销记录（消课）
export const teacherCheckIns = [
  {
    id: 'ci1',
    sessionId: 'cs1',
    sessionName: '钢琴启蒙A班',
    teacherId: '1',
    teacherName: '李雪',
    studentId: '1',
    studentName: '朵朵',
    date: '2026-04-01',
    startTime: '10:00',
    duration: 60,
    status: 'attended', // attended | absent | leave
    note: '',
    checkedAt: '2026-04-01 11:02',
  },
  {
    id: 'ci2',
    sessionId: 'cs1',
    sessionName: '钢琴启蒙A班',
    teacherId: '1',
    teacherName: '李雪',
    studentId: '4',
    studentName: '豆豆',
    date: '2026-04-01',
    startTime: '10:00',
    duration: 60,
    status: 'attended',
    note: '',
    checkedAt: '2026-04-01 11:03',
  },
  {
    id: 'ci3',
    sessionId: 'cs3',
    sessionName: '钢琴进阶班',
    teacherId: '1',
    teacherName: '李雪',
    studentId: '2',
    studentName: '小明',
    date: '2026-03-26',
    startTime: '10:00',
    duration: 60,
    status: 'absent',
    note: '未到课',
    checkedAt: '2026-03-26 11:05',
  },
]

// 家庭共享成员
export const familyMembers = [
  {
    id: 'f1',
    name: '王先生',
    relation: '爸爸',
    phone: '138****8889',
    avatar: '/images/avatars/parent-dad.jpg',
    permission: 'full', // full | readonly
    joinDate: '2025-09-10',
  },
]

export const classes = [
  {
    id: '1',
    name: '钢琴启蒙A班',
    course: '钢琴启蒙',
    teacher: '李雪',
    studentCount: 1,
    maxStudents: 1,
    schedule: '周六 10:00-11:00',
    type: '1对1',
  },
  {
    id: '2',
    name: '乐理基础班',
    course: '乐理基础',
    teacher: '王明',
    studentCount: 8,
    maxStudents: 12,
    schedule: '周日 14:00-15:30',
    type: '小班课',
  },
]

export const todayScheduleB = [
  {
    id: '1',
    time: '10:00-11:00',
    className: '钢琴启蒙A班',
    teacher: '李雪',
    classroom: '3号琴房',
    student: '朵朵',
    status: 'upcoming',
  },
  {
    id: '2',
    time: '11:00-12:00',
    className: '钢琴启蒙B班',
    teacher: '李雪',
    classroom: '3号琴房',
    student: '小明',
    status: 'upcoming',
  },
  {
    id: '3',
    time: '14:00-15:00',
    className: '钢琴进阶班',
    teacher: '李雪',
    classroom: '1号琴房',
    student: '豆豆',
    status: 'upcoming',
  },
]

export const warningStudents = [
  {
    id: '2',
    name: '小明',
    avatar: '/images/avatars/child-xiaoming.jpg',
    level: 'red',
    reason: '剩余课时不足10%',
    remainingClasses: 5,
    totalClasses: 48,
    lastContact: '3天前',
  },
  {
    id: '3',
    name: '欣欣',
    avatar: '/images/avatars/child-xinxin.jpg',
    level: 'red',
    reason: '课时已耗尽',
    remainingClasses: 0,
    totalClasses: 24,
    lastContact: '7天前',
  },
  {
    id: '5',
    name: '乐乐',
    avatar: '/images/avatars/child-lele.jpg',
    level: 'yellow',
    reason: '连续2次请假',
    remainingClasses: 12,
    totalClasses: 24,
    lastContact: '5天前',
  },
]

// B端 - 本周请假记录（dayOfWeek 0=周一，sessionId 关联班次）
export const leaveRecords = [
  { id: 'l1', sessionId: 'cs1', studentId: '1', dayOfWeek: 1, reason: '感冒发烧' },
  { id: 'l2', sessionId: 'cs4', studentId: '2', dayOfWeek: 0, reason: '家庭出行' },
  { id: 'l3', sessionId: 'cs4', studentId: '3', dayOfWeek: 2, reason: '临时有事' },
  { id: 'l4', sessionId: 'cs3', studentId: '5', dayOfWeek: 5, reason: '外出旅游' },
]

// O端运营数据
export const platformStats = {
  totalParents: 125680,
  parentGrowth: 12.5,
  totalInstitutions: 3256,
  institutionGrowth: 8.3,
  paidInstitutions: 892,
  conversionRate: 27.4,
  monthlyRevenue: 2890000,
  revenueGrowth: 15.2,
  dailyActiveUsers: 45600,
  dauGrowth: 6.8,
  monthlyActiveUsers: 98500,
  mauGrowth: 9.2,
}

export const pendingInstitutions = [
  {
    id: '1',
    name: '星光舞蹈艺术中心',
    contact: '周女士',
    phone: '138****1234',
    address: '杭州市拱墅区大关路88号',
    type: '舞蹈培训',
    submitTime: '2026-03-28 09:30',
    status: 'pending',
  },
  {
    id: '2',
    name: '智慧树早教中心',
    contact: '陈先生',
    phone: '139****5678',
    address: '杭州市滨江区江南大道200号',
    type: '早教托育',
    submitTime: '2026-03-28 08:15',
    status: 'pending',
  },
  {
    id: '3',
    name: '小小科学家实验室',
    contact: '林女士',
    phone: '137****9012',
    address: '杭州市上城区解放路100号',
    type: 'STEM教育',
    submitTime: '2026-03-27 16:45',
    status: 'pending',
  },
]

export const recentOrders = [
  {
    id: 'ORD202603280001',
    institution: '七彩音乐艺术中心',
    product: 'AI增长版年费',
    amount: 9800,
    payTime: '2026-03-28 10:23',
    payMethod: '微信支付',
    status: 'paid',
  },
  {
    id: 'ORD202603280002',
    institution: '小画家美术工作室',
    product: 'AI积分包-500点',
    amount: 500,
    payTime: '2026-03-28 09:45',
    payMethod: '支付宝',
    status: 'paid',
  },
  {
    id: 'ORD202603270003',
    institution: '酷码编程',
    product: '基础版年费',
    amount: 0,
    payTime: '2026-03-27 14:30',
    payMethod: '免费开通',
    status: 'paid',
  },
]

export const leadPool = [
  {
    id: '1',
    parentName: '刘女士',
    phone: '135****7890',
    childAge: 6,
    demand: '想找钢琴老师，最好是周末上课',
    location: '西湖区',
    submitTime: '2026-03-28 11:20',
    status: 'new',
  },
  {
    id: '2',
    parentName: '孙先生',
    phone: '136****2345',
    childAge: 8,
    demand: '孩子对编程感兴趣，想找Scratch入门课',
    location: '滨江区',
    submitTime: '2026-03-28 10:05',
    status: 'contacted',
  },
  {
    id: '3',
    parentName: '马女士',
    phone: '138****6789',
    childAge: 4,
    demand: '找美术启蒙���，离家近优先',
    location: '拱墅区',
    submitTime: '2026-03-27 16:30',
    status: 'assigned',
    assignedTo: '七彩音乐艺术中心',
  },
]

// 请假申请数据
export const leaveRequests = [
  {
    id: '1',
    studentName: '朵朵',
    studentAvatar: '/images/avatars/child-duoduo-photo.jpg',
    parentName: '王女士',
    courseName: '钢琴启蒙',
    className: '钢琴启蒙A班',
    originalTime: '2026-03-28 10:00-11:00',
    reason: '孩子感冒发烧，需要在家休息',
    submitTime: '2026-03-27 20:30',
    status: 'pending',
  },
  {
    id: '2',
    studentName: '小明',
    studentAvatar: '/images/avatars/child-xiaoming.jpg',
    parentName: '李先生',
    courseName: '钢琴进阶',
    className: '钢琴进阶班',
    originalTime: '2026-03-29 14:00-15:00',
    reason: '家里有事需要外出',
    submitTime: '2026-03-28 08:15',
    status: 'pending',
  },
  {
    id: '3',
    studentName: '豆豆',
    studentAvatar: '/images/avatars/child-doudou.jpg',
    parentName: '赵先生',
    courseName: '钢琴启蒙',
    className: '钢琴启蒙A班',
    originalTime: '2026-03-25 10:00-11:00',
    reason: '学校有活动',
    submitTime: '2026-03-24 18:00',
    status: 'approved',
    makeupTime: '2026-03-31 10:00-11:00',
  },
]

// 线索广场数据
export const leadsSquare = [
  {
    id: '1',
    parentName: '刘女士',
    childAge: 6,
    demand: '想给孩子找钢琴老师，希望周末上课，有耐心的老师',
    category: '音乐培训',
    location: '西湖区文三路',
    distance: 0.8,
    submitTime: '2026-03-28 11:20',
    status: 'new',
    budget: '150-200元/课时',
  },
  {
    id: '2',
    parentName: '孙先生',
    childAge: 8,
    demand: '孩子对编程感兴趣，想找Scratch入门课，最好小班教学',
    category: 'STEM教育',
    location: '西湖区古翠路',
    distance: 1.2,
    submitTime: '2026-03-28 10:05',
    status: 'new',
    budget: '180-250元/课时',
  },
  {
    id: '3',
    parentName: '马女士',
    childAge: 4,
    demand: '找美术启蒙班，培养孩子的审美和创造力',
    category: '美术培训',
    location: '西湖区文二路',
    distance: 1.5,
    submitTime: '2026-03-27 16:30',
    status: 'contacted',
    budget: '100-150元/课时',
  },
  {
    id: '4',
    parentName: '周先生',
    childAge: 5,
    demand: '想让孩子学小提琴，之前没有任何基础',
    category: '音乐培训',
    location: '西湖区天目山路',
    distance: 2.1,
    submitTime: '2026-03-27 14:20',
    status: 'new',
    budget: '200-300元/课时',
  },
  {
    id: '5',
    parentName: '陈女士',
    childAge: 7,
    demand: '孩子想学架子鼓，性格比较活泼',
    category: '音乐培训',
    location: '西湖区教工路',
    distance: 0.5,
    submitTime: '2026-03-27 09:15',
    status: 'grabbed',
    budget: '120-180元/课时',
  },
]

// 老带新活动数据
export const referralActivities = [
  {
    id: '1',
    name: '春季招生转介绍活动',
    type: 'referral',
    reward: '老学员推荐成功赠送2节课',
    newStudentReward: '新学员首次报名9折优惠',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    status: 'active',
    totalReferrals: 23,
    successReferrals: 18,
    totalReward: 36,
  },
  {
    id: '2',
    name: '双人拼团特惠',
    type: 'groupon',
    reward: '2人成团各减200元',
    newStudentReward: '',
    startDate: '2026-03-15',
    endDate: '2026-03-31',
    status: 'active',
    totalReferrals: 8,
    successReferrals: 6,
    totalReward: 2400,
  },
]

export const referralRecords = [
  {
    id: '1',
    referrerName: '王女士',
    referrerStudent: '朵朵',
    newParentName: '李女士',
    newStudentName: '小雨',
    courseName: '钢琴启蒙',
    referTime: '2026-03-25 14:30',
    status: 'success',
    rewardClasses: 2,
  },
  {
    id: '2',
    referrerName: '赵先生',
    referrerStudent: '豆豆',
    newParentName: '钱��士',
    newStudentName: '贝贝',
    courseName: '钢琴启蒙',
    referTime: '2026-03-22 10:15',
    status: 'success',
    rewardClasses: 2,
  },
  {
    id: '3',
    referrerName: '李先生',
    referrerStudent: '小明',
    newParentName: '孙先生',
    newStudentName: '乐乐',
    courseName: '钢琴进阶',
    referTime: '2026-03-20 16:00',
    status: 'pending',
    rewardClasses: 0,
  },
]

// AI成长报告数据
export const growthReports = [
  {
    id: '1',
    studentName: '朵朵',
    studentAvatar: '/images/avatars/child-duoduo-photo.jpg',
    courseName: '钢琴启蒙',
    month: '2026年3月',
    status: 'generated',
    generatedAt: '2026-03-28 10:00',
    sentAt: '2026-03-28 10:05',
    summary: '朵朵本月表现优秀，在节奏感和手指灵活度方面有明显进步',
    highlights: ['完成《小星星》演奏', '节奏准确率提升20%', '识谱能力增强'],
    attendance: 4,
    totalClasses: 4,
    teacherComment: '朵朵学习态度认真，对音乐有很好的感知力，建议继续保持每日练习',
  },
  {
    id: '2',
    studentName: '小明',
    studentAvatar: '/images/avatars/child-xiaoming.jpg',
    courseName: '钢琴进阶',
    month: '2026年3月',
    status: 'draft',
    generatedAt: null,
    sentAt: null,
    summary: '',
    highlights: [],
    attendance: 3,
    totalClasses: 4,
    teacherComment: '',
  },
  {
    id: '3',
    studentName: '豆豆',
    studentAvatar: '/images/avatars/child-doudou.jpg',
    courseName: '钢琴启蒙',
    month: '2026年3月',
    status: 'generated',
    generatedAt: '2026-03-27 15:30',
    sentAt: null,
    summary: '豆豆本月在基础指法方面有了很好的进步，学习热情高涨',
    highlights: ['掌握C大调音阶', '学会正确的坐姿和手型', '能独立完成简单曲目'],
    attendance: 4,
    totalClasses: 4,
    teacherComment: '豆豆是个勤奋好学的孩子，建议家长多给予鼓励',
  },
]

export const allInstitutions = [
  {
    id: '1',
    name: '七彩音乐艺术中心',
    contact: '王校长',
    phone: '0571-88888888',
    address: '杭州市西湖区文三路168号',
    type: '音乐培训',
    version: 'AI增长版',
    status: 'active',
    studentCount: 156,
    joinDate: '2025-06-01',
    expireDate: '2027-06-01',
  },
  {
    id: '2',
    name: '小画家美术工作室',
    contact: '李老师',
    phone: '0571-77777777',
    address: '杭州市西湖区教工路55号',
    type: '美术培训',
    version: '基础版',
    status: 'active',
    studentCount: 89,
    joinDate: '2025-09-15',
    expireDate: '2026-09-15',
  },
  {
    id: '3',
    name: '酷码编程',
    contact: '张总',
    phone: '0571-66666666',
    address: '杭州市滨江区网商路333号',
    type: 'STEM教育',
    version: 'AI增长版',
    status: 'active',
    studentCount: 234,
    joinDate: '2025-03-01',
    expireDate: '2026-03-01',
  },
]
