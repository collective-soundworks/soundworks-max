{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 1,
			"revision" : 8,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 303.0, 79.0, 656.0, 739.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-14",
					"maxclass" : "button",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 63.0, 25.0, 24.0, 24.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-10",
					"maxclass" : "number",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 39.0, 137.0, 50.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-15",
					"linecount" : 5,
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 540.0, 206.0, 53.0, 76.0 ],
					"text" : "config dictionary u135010251"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-13",
					"maxclass" : "dict.view",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 1118.0, 229.0, 169.0, 200.076923012733459 ]
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.720698, 0.16723, 0.080014, 1.0 ],
					"id" : "obj-5",
					"linecount" : 13,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 393.0, 499.230769038200378, 152.0, 181.0 ],
					"text" : "PROBLEME multiples abstractions !!\n--> si on en supprime une, on se détache, meme si d'autres sont encore actives!\n--> solution temporaire, quand le patch sharedState est supprimé, le detach n'est pas envoyé. Il faut manuellement se détacher."
				}

			}
, 			{
				"box" : 				{
					"fontface" : 1,
					"id" : "obj-80",
					"linecount" : 10,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 13.0, 189.0, 359.0, 141.0 ],
					"text" : "ATTENTION\n- envoyer les valeurs à la création des objets !!!!\n- il faudrait avoir un getValues.\n- debug multiples instance of sharedState --> envoyer des detach-notif quand on envoie plusieurs attach à la suite\n- refaire l'arborescence pour pouvoir lancer node dans Max\n\nautre petit truc :\nest-ce qu'on peut savoir si dans soundworks on a un slider ou une boite à nombre ?"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-109",
					"linecount" : 5,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 35.0, 632.0, 151.0, 74.0 ],
					"text" : "autre petit truc :\nest-ce qu'on peut savoir si dans soundworks on a un slider ou une boite à nombre ?"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-107",
					"maxclass" : "dict.view",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 612.0, 210.0, 160.0, 364.076923012733459 ]
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.145098039215686, 1.0, 0.0, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.145098039215686, 1.0, 0.0, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-102",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 1051.0, 157.0, 69.0, 22.0 ],
					"text" : "getSchema"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.0, 1.0, 0.133333333333333, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.0, 1.0, 0.133333333333333, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-240",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 927.346161901950836, 139.0, 63.0, 22.0 ],
					"text" : "createGUI"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.0, 1.0, 0.070588235294118, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.0, 1.0, 0.070588235294118, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-6",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 356.0, 110.5, 41.0, 22.0 ],
					"text" : "attach"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-17",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 1183.0, 582.0, 88.0, 22.0 ],
					"text" : "s sw._udpsend"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 1183.0, 542.0, 99.0, 22.0 ],
					"text" : "r sw._udpreceive"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-134",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 1044.0, 71.0, 150.0, 20.0 ],
					"text" : "isf.launcher"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-131",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 353.0, 17.0, 150.0, 20.0 ],
					"text" : "liste de tous les schémas"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.0, 1.0, 0.133333333333333, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.0, 1.0, 0.133333333333333, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-101",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 676.0, 147.0, 63.0, 22.0 ],
					"text" : "createGUI"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-98",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 356.0, 183.0, 61.0, 22.0 ],
					"text" : "getValues"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-96",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 490.0, 147.0, 67.0, 22.0 ],
					"text" : "get volume"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.176470588235294, 1.0, 0.0, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.176470588235294, 1.0, 0.0, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-61",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 414.0, 147.0, 69.0, 22.0 ],
					"text" : "getSchema"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-60",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 974.0, 163.0, 45.0, 22.0 ],
					"text" : "detach"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-59",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "dictionary" ],
					"patching_rect" : [ 955.0, 194.0, 121.0, 22.0 ],
					"text" : "sw.sharedState other"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.0, 1.0, 0.070588235294118, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.0, 1.0, 0.070588235294118, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-47",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 356.0, 147.0, 45.0, 22.0 ],
					"text" : "detach"
				}

			}
, 			{
				"box" : 				{
					"format" : 6,
					"id" : "obj-35",
					"maxclass" : "flonum",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "bang" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 571.0, 99.0, 50.0, 22.0 ]
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.019607843137255, 1.0, 0.0, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 0.019607843137255, 1.0, 0.0, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-30",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 570.0, 147.0, 83.0, 22.0 ],
					"text" : "set volume $1"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-28",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "dictionary" ],
					"patching_rect" : [ 570.0, 174.0, 132.0, 22.0 ],
					"text" : "sw.sharedState globals"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-11",
					"linecount" : 3,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 126.0, 69.0, 290.0, 47.0 ],
					"text" : "@ip \n@portsend\n@portrecv"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 1.0, 0.0, 0.0, 1.0 ],
					"bgcolor2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_angle" : 270.0,
					"bgfillcolor_autogradient" : 0.0,
					"bgfillcolor_color" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_color1" : [ 1.0, 0.0, 0.0, 1.0 ],
					"bgfillcolor_color2" : [ 0.2, 0.2, 0.2, 1.0 ],
					"bgfillcolor_proportion" : 0.5,
					"bgfillcolor_type" : "gradient",
					"gradient" : 1,
					"id" : "obj-9",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 276.0, 17.0, 75.0, 22.0 ],
					"text" : "getSchemas"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 23.0, 78.0, 101.0, 22.0 ],
					"text" : "sw.StateManager"
				}

			}
, 			{
				"box" : 				{
					"args" : [ "globals", "volume", -80, 6 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-3",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "integer.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 453.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "globals", "mute", 0, 0 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-7",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "boolean.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 488.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "globals", "gain", 0, 1 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-12",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "float.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 523.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "globals", "message", 0, 0 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-16",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "string.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 558.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "globals", "config", 0, 0 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-19",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "any.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "dictionary" ],
					"patching_rect" : [ 17.0, 593.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "other", "myBoolean", 0, 0 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-21",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "boolean.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 348.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
, 			{
				"box" : 				{
					"args" : [ "other", "myFloat", -1, 1 ],
					"bgmode" : 0,
					"border" : 0,
					"clickthrough" : 0,
					"enablehscroll" : 0,
					"enablevscroll" : 0,
					"id" : "obj-23",
					"lockeddragscroll" : 0,
					"maxclass" : "bpatcher",
					"name" : "float.sw.bp.maxpat",
					"numinlets" : 1,
					"numoutlets" : 1,
					"offset" : [ 0.0, 0.0 ],
					"outlettype" : [ "" ],
					"patching_rect" : [ 17.0, 383.0, 285.0, 25.0 ],
					"viewvisibility" : 1
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-101", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-59", 0 ],
					"source" : [ "obj-102", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1", 0 ],
					"source" : [ "obj-14", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-59", 0 ],
					"source" : [ "obj-240", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-107", 0 ],
					"source" : [ "obj-28", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-15", 1 ],
					"source" : [ "obj-28", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-30", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-30", 0 ],
					"source" : [ "obj-35", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-47", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-13", 0 ],
					"source" : [ "obj-59", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-6", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-59", 0 ],
					"source" : [ "obj-60", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-61", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-96", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-28", 0 ],
					"source" : [ "obj-98", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "float.sw.bp.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "boolean.sw.bp.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "any.sw.bp.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "string.sw.bp.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "integer.sw.bp.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "sw.StateManager.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "sw.abs.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "abscounter.js",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/code",
				"patcherrelativepath" : "../code",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "sw.sharedState.maxpat",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/patchers",
				"patcherrelativepath" : ".",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "parseDict.js",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/code",
				"patcherrelativepath" : "../code",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "notifydeleted.js",
				"bootpath" : "~/Documents/GitHub/soundworks_state-manager_osc-test/max/SoundworksMaxAPI/code",
				"patcherrelativepath" : "../code",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "spat5.osc.prepend.mxo",
				"type" : "iLaX"
			}
, 			{
				"name" : "spat5.osc.route.mxo",
				"type" : "iLaX"
			}
 ],
		"autosave" : 0
	}

}
